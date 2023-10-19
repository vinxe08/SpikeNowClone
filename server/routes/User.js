const express = require("express");
const router = express.Router();
const Imap = require("imap"),
  inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
// const process = require("process");

const { getIncomingEmail, connectionError } = require("../lib/socketManager");

const CreateServices = require("../services/User/Create");
const RecipientsService = require("../services/User/Retrieve");
const GetUserService = require("../services/User/GetUser");
const GroupServices = require("../services/GroupConversation/Retrieve");

// Sends the new email from server to socket to client
const fetchNewEmail = (newEmail, email) => {
  getIncomingEmail(newEmail, email);
};

router.post("/users", async (req, res) => {
  const { imap_server, imap_port, email, password } = req.body;

  // FOR INCOMING MAIL - This will notify the user when ever there's a new mail
  const im = new Imap({
    user: email,
    password: password,
    host: imap_server,
    port: imap_port,
    tls: true,
    socketTimeout: 30000,
  });

  im.once("error", (err) => {
    // Handles the connection error
    connectionError(err);
  });

  im.once("ready", () => {
    const newEmail = [];

    im.openBox("INBOX", true, (err, box) => {
      if (err) throw new Error(err);
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };

      im.on("mail", (numNewMsgs) => {
        const fetch = im.seq.fetch(
          box.messages.total - numNewMsgs + 1 + ":" + box.messages.total,
          fetchOptions
        );

        fetch.on("message", (msg, seqno) => {
          let data = { header: "", body: "" };

          msg.on("body", (stream, info) => {
            let messageText = "";

            stream.on("data", (chunk) => {
              messageText += chunk.toString("utf8");
            });

            stream.on("end", async () => {
              if (info.which !== "TEXT") {
                const header = Imap.parseHeader(messageText);
                data.header = header;
              } else if (info.which === "TEXT") {
                data.body = messageText;
              }
            });
          });

          msg.once("end", () => {
            newEmail.push(data);
          });
        });

        fetch.on("error", (err) => {
          throw new Error(err);
        });

        fetch.once("end", async () => {
          const parseEmail = async () => {
            try {
              const emailPromises = newEmail.map(async (email) => {
                const body = await simpleParser(email.body);
                let emailBody;

                if (body.text) {
                  const originalString = body.text;
                  const endString = body.headerLines[0].line;
                  const endIndex = originalString.indexOf(endString);
                  if (endIndex !== -1) {
                    const truncatedString = originalString.substring(
                      0,
                      endIndex
                    );
                    emailBody = truncatedString;
                  } else {
                    emailBody = body.text;
                  }
                } else if (body.headerLines.length > 0) {
                  emailBody = body.headerLines?.[0].line;
                }

                const data = { header: email.header, body: emailBody };

                return data;
              });

              const emails = await Promise.all(emailPromises);

              return { emails };
            } catch (error) {
              throw new Error(error);
            }
          };

          parseEmail()
            .then(({ emails }) => {
              fetchNewEmail(emails, email);
              // im.end();
            })
            .catch((error) => {
              fetchNewEmail(error);
            });
        });
      });
    });
  });

  im.once("end", function () {});

  im.connect();

  // ----------------------- FOR EMAIL & REPLY ---------------------
  // IMAP configuration
  const imap = new Imap({
    user: email,
    password: password,
    host: imap_server,
    port: imap_port,
    tls: true,
    socketTimeout: 30000,
  });

  imap.once("error", (err) => {
    if (!res.headersSent) {
      res.status(500).send({ error: err });
    }
  });

  imap.once("ready", () => {
    let allEmail = {
      email: null,
      reply: null,
    };

    // ---------------- FOR USER's INBOX -------------------------
    imap.openBox("INBOX", true, (err, box) => {
      if (err) throw new Error(err);
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };
      imap.search(["ALL"], (searchErr, results) => {
        if (searchErr) throw new Error(searchErr);

        const emailList = [];

        const fetch = imap.fetch(results, fetchOptions);
        fetch.on("message", (msg, seqno) => {
          let data = { header: "", body: "" };

          msg.on("body", (stream, info) => {
            let buffer = "";

            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });

            stream.on("end", async () => {
              if (info.which !== "TEXT") {
                const header = Imap.parseHeader(buffer);
                data.header = header;
              } else if (info.which === "TEXT") {
                data.body = buffer;
              }
            });
          });

          msg.on("attributes", function (attrs) {});

          msg.on("end", async function () {
            emailList.push(data);
          });
        });

        fetch.on("error", (err) => {
          throw new Error(err);
        });

        fetch.once("end", async () => {
          const user = await CreateServices(req.body);
          const groups = await GroupServices(req.body);
          allEmail.email = emailList;

          // ------------------ FOR USER's SEND/REPLY --------------------
          imap.openBox("SENT", true, (err, mailbox) => {
            if (err) throw new Error(err);
            const fetchOptions = {
              bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
              struct: true,
            };

            imap.search(["ALL"], (searchErr, results) => {
              if (searchErr) throw new Error(searchErr);

              const replyList = [];

              const f = imap.fetch(results, fetchOptions);
              f.on("message", (msg, seqno) => {
                let reply = { header: "", body: "" };

                msg.on("body", (stream, info) => {
                  let buffer = "";

                  stream.on("data", (chunk) => {
                    buffer += chunk.toString("utf8");
                  });

                  stream.on("end", async () => {
                    if (info.which !== "TEXT") {
                      const header = Imap.parseHeader(buffer);
                      reply.header = header;
                    } else if (info.which === "TEXT") {
                      reply.body = buffer;
                    }
                  });
                });

                msg.on("attributes", function (attrs) {});

                msg.on("end", async function () {
                  replyList.push(reply);
                });
              });

              f.on("error", (err) => {
                throw new Error(err);
              });

              f.once("end", async () => {
                allEmail.reply = replyList;

                // --------------- Modify the email for INBOX & SENT/REPLY ----------------------
                const parseEmail = async () => {
                  try {
                    // ----------- EMAIL FOR INBOX --------------
                    const emailPromises = allEmail.email.map(async (email) => {
                      const body = await simpleParser(email.body);
                      let emailBody;

                      if (body.text) {
                        const originalString = body.text;
                        const endString = body.headerLines[0].line;
                        const endIndex = originalString.indexOf(endString);
                        if (endIndex !== -1) {
                          const truncatedString = originalString.substring(
                            0,
                            endIndex
                          );
                          emailBody = truncatedString;
                        } else {
                          emailBody = body.text;
                        }
                      } else if (body.headerLines.length > 0) {
                        emailBody = body.headerLines?.[0].line;
                      }

                      const data = { header: email.header, body: emailBody };
                      return data;
                    });

                    // ----------- EMAIL FOR REPLY/SENT --------------
                    const replyPromises = allEmail.reply.map(async (email) => {
                      const body = await simpleParser(email.body);

                      let emailBody;

                      if (body.text) {
                        const originalString = body.text;
                        const endString = body.headerLines[0].line;
                        const endIndex = originalString.indexOf(endString);
                        if (endIndex !== -1) {
                          const truncatedString = originalString.substring(
                            0,
                            endIndex
                          );
                          emailBody = truncatedString;
                        } else {
                          emailBody = body.text;
                        }
                      } else if (
                        body.headerLines.length > 0 &&
                        body.headerLines?.[0].line !== "<html>"
                      ) {
                        emailBody = body.headerLines?.[0].line;
                      } else {
                        emailBody = email.body;
                      }

                      const data = { header: email.header, body: emailBody };
                      return data;
                    });

                    const emails = await Promise.all(emailPromises);
                    const replies = await Promise.all(replyPromises);

                    return { emails, replies };
                  } catch (error) {
                    throw new Error(searchErr);
                  }
                };

                parseEmail()
                  .then(({ emails, replies }) => {
                    res.status(200).send({
                      email: { inbox: emails, sent: replies },
                      error: user.error,
                      userExist: user.userExist,
                      groups,
                    });

                    imap.end();
                  })
                  .catch((error) => {
                    if (error) {
                      throw new Error(error);
                    }
                    imap.end();
                  });
              });
            });
          });
        });
      });
    });

    imap.once("end", function () {});

    imap.connect();
  });
  process.on("beforeExit", function () {
    im.end();
    imap.end(); // Close the IMAP connection
    process.exit(); // Exit the Node.js process
  });
});

router.post("/getUser", async (req, res) => {
  try {
    const result = await GetUserService(req.body);
    res.status(200).send({ status: true, data: result });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post("/recipients", async (req, res) => {
  try {
    const result = await RecipientsService(req.body);
    res.status(200).send({ status: true, data: result });
  } catch (error) {
    res.status(500).send({ status: false, error });
  }
});

module.exports = router;
