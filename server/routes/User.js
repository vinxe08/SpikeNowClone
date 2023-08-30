const express = require("express");
const router = express.Router();
const Imap = require("imap"),
  inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;

const CreateServices = require("../services/User/Create");
const RecipientsService = require("../services/User/Retrieve");
const GetUserService = require("../services/User/GetUser");
const GroupServices = require("../services/GroupConversation/Retrieve");

router.post("/users", async (req, res) => {
  const { imap_server, imap_port, email, password } = req.body;

  // console.log("REQ.BODY: ", req.body);

  // IMAP configuration
  const imap = new Imap({
    user: email,
    password: password,
    host: imap_server,
    port: imap_port,
    tls: true,
  });

  imap.connect();

  imap.once("ready", () => {
    let allEmail = {
      email: null,
      reply: null,
    };

    // FOR USER's INBOX
    imap.openBox("INBOX", true, (err, mailbox) => {
      if (err) res.status(500).send({ error: err });
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };

      imap.search(["ALL"], (searchErr, results) => {
        if (searchErr) res.status(500).send({ error: searchErr });

        const emailList = [];

        // results.forEach((uid) => {
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

        fetch.once("end", async () => {
          const user = await CreateServices(req.body);
          const groups = await GroupServices(req.body);
          allEmail.email = emailList;
          // console.log("INBOX: ", allEmail.email);

          // FOR USER's SEND/REPLY
          imap.openBox("SENT", true, (err, mailbox) => {
            if (err) res.status(500).send({ error: err });
            const fetchOptions = {
              bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
              struct: true,
            };

            imap.search(["ALL"], (searchErr, results) => {
              if (searchErr) res.status(500).send({ error: searchErr });

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

              f.once("end", async () => {
                allEmail.reply = replyList;
                // console.log("REPLY: ", replyList);
                // For the reply, some email dont contain data when using simpleParser, and some has.
                // TRY LOGIC: if(body.text) -> body.text -> else -> replyList

                // Make this for allEmail.reply also
                const parseEmail = async () => {
                  try {
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
                        // console.log("body: ", body);
                        emailBody = body.headerLines?.[0].line;
                      }

                      const data = { header: email.header, body: emailBody };
                      return data;
                    });

                    const replyPromises = allEmail.reply.map(async (email) => {
                      const body = await simpleParser(email.body);
                      // console.log("RAW: ", email);
                      // console.log("BODY: ", body);
                      // console.log("RAW: ", email, "BODY: ", body);

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
                        // console.log("body: ", body);
                        emailBody = body.headerLines?.[0].line;
                      } else {
                        emailBody = email.body;
                      }

                      const data = { header: email.header, body: emailBody };
                      return data;
                    });

                    const emails = await Promise.all(emailPromises);
                    const replies = await Promise.all(replyPromises);

                    // console.log("REPLIES: ", replies);
                    return { emails, replies };
                  } catch (error) {
                    throw error;
                  }

                  // const emails = await Promise.all(
                  //   allEmail.email.map(async (email) => {
                  //     const body = await simpleParser(email.body);
                  //     let emailBody;
                  //     console.log("BODY: ", body);

                  //     // Used to trim extra details of the email
                  //     if (body.text) {
                  //       const originalString = body.text;
                  //       const endString = body.headerLines[0].line;
                  //       const endIndex = originalString.indexOf(endString);
                  //       if (endIndex !== -1) {
                  //         const truncatedString = originalString.substring(
                  //           0,
                  //           endIndex
                  //         );
                  //         emailBody = truncatedString;
                  //       } else {
                  //         emailBody = body.text;
                  //       }
                  //     } else if (body.headerLines.length > 0) {
                  //       // console.log("body: ", body);
                  //       emailBody = body.headerLines?.[0].line;
                  //     }

                  //     const data = { header: email.header, body: emailBody };
                  //     return data;
                  //   })
                  // );

                  // console.log("REPLY: ", allEmail.reply);
                  // return { inbox: emails, sent: allEmail.reply };
                };

                parseEmail()
                  .then(({ emails, replies }) => {
                    // console.log("REPLYLIST: ", replyList);
                    // console.log("EMAILS PARSED: ", emails);
                    // console.log("REPLIES PARSED: ", replies);
                    res.status(200).send({
                      email: { inbox: emails, sent: replies },
                      error: user.error,
                      userExist: user.userExist,
                      groups,
                    });

                    imap.end();
                  })
                  .catch((error) => {
                    // console.log("ERROR 247: ", error);
                    res.status(500).send({
                      error: error,
                      message: "ERROR",
                    });
                  });
              });
            });
          });
          // END

          // const parseEmail = async () => {
          //   const emails = await Promise.all(
          //     emailList.map(async (email) => {
          //       const body = await simpleParser(email.body);
          //       let emailBody;

          //       // Used to trim extra details of the email
          //       if (body.text) {
          //         const originalString = body.text;
          //         const endString = body.headerLines[0].line;
          //         const endIndex = originalString.indexOf(endString);
          //         if (endIndex !== -1) {
          //           const truncatedString = originalString.substring(
          //             0,
          //             endIndex
          //           );
          //           emailBody = truncatedString;
          //         } else {
          //           emailBody = body.text;
          //         }
          //       } else if (body.headerLines.length > 0) {
          //         console.log("body: ", body);
          //         emailBody = body.headerLines?.[0].line;
          //       }
          //       const data = { header: email.header, body: emailBody };
          //       return data;
          //     })
          //   );

          //   return emails;
          // };

          // parseEmail()
          //   .then((emails) => {
          //     res.status(200).send({
          //       email: emails,
          //       error: user.error,
          //       userExist: user.userExist,
          //     });

          //     imap.end();
          //   })
          //   .catch((error) => {
          //     console.log("ERROR 247: ", error);
          //     res.status(500).send({
          //       error: error,
          //       message: "ERROR",
          //     });
          //   });
        });
      });
    });
  });
});

router.post("/getUser", async (req, res) => {
  try {
    const result = await GetUserService(req.body);
    res.status(200).send({ status: true, data: result });
  } catch (error) {
    // console.log("ERROR: ", error);
    res.status(500).send({ error });
  }
});

router.post("/recipients", async (req, res) => {
  const result = await RecipientsService(req.body);
  res.status(200).send({ status: true, data: result });
});

module.exports = router;
