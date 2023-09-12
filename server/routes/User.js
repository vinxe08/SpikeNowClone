const express = require("express");
const router = express.Router();
const Imap = require("imap"),
  inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;

// console.log("USER");
const { getIncomingEmail } = require("../lib/socketManager");

const fetchNewEmail = (newEmail) => {
  console.log("NEW: ", newEmail[0]);
  // console.log("IO: ", io);
  // io.on("connection", (socket) => {
  //   console.log("user.js-connection: ", newEmail);
  //   socket.emit("new email", newEmail);
  // });
  getIncomingEmail(newEmail[0]);
};

const mailPromises = async (emails) => {
  emails.map(async (email) => {
    const body = await simpleParser(email.body);
    let emailBody;

    if (body.text) {
      const originalString = body.text;
      const endString = body.headerLines[0].line;
      const endIndex = originalString.indexOf(endString);
      if (endIndex !== -1) {
        const truncatedString = originalString.substring(0, endIndex);
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
};

// console.log("USER IO: ", io);
// try {
// const { io } = require("../index");
// // Use 'io' here
// io.on("connection", (socket) => {
//   // Your socket.io logic here
//   console.log("IO TRY: ", socket);
// });
// } catch (error) {
//   console.error('Error importing "io" from index.js:', error);
// }

const CreateServices = require("../services/User/Create");
const RecipientsService = require("../services/User/Retrieve");
const GetUserService = require("../services/User/GetUser");
const GroupServices = require("../services/GroupConversation/Retrieve");

router.post("/users", async (req, res) => {
  const { imap_server, imap_port, email, password } = req.body;

  // FOR INCOMING MAIL - This will notify the user when ever there's a new mail
  const im = new Imap({
    user: email,
    password: password,
    host: imap_server,
    port: imap_port,
    tls: true,
  });

  im.connect();

  im.once("ready", () => {
    // console.log("IM IS READY");
    const newEmail = [];

    im.openBox("INBOX", true, (err, box) => {
      if (err) res.status(500).send({ error: err });
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };
      // console.log("IM OPEN BOX");

      im.on("mail", (numNewMsgs) => {
        // console.log("IM IS ON `MAIL`");
        // const fetch = im.seq.fetch(
        //   box.messages.total + ":" + (box.messages.total - numNewMsgs + 1),
        //   fetchOptions
        // );
        console.log("NEW MESSAGE");

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
            // Emit the email content to connected clients
            // io.emit("newEmail", { content: messageText });
            // fetchNewEmail(messageText);
            newEmail.push(data);
          });
        });

        fetch.on("error", (err) => {
          console.log("ERROR in im fetch", err);
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
                  // console.log("body: ", body);
                  emailBody = body.headerLines?.[0].line;
                }

                const data = { header: email.header, body: emailBody };

                return data;
              });

              const emails = await Promise.all(emailPromises);

              return { emails };
            } catch (error) {
              console.log("CATCH ERROR: ", error); // send this in your client
            }
          };

          parseEmail()
            .then(({ emails }) => {
              fetchNewEmail(emails);
              im.end();
            })
            .catch((error) => {
              console.log("ParseEmail ERROR: ", error);
              fetchNewEmail(error);
              im.end();
            });
        });
      });
    });
    // ------------ END FOR NEW MAIL ----------------
  });

  im.once("end", function () {
    console.log(" NEW Connection ended");
  });

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

    const newEmail = [];

    // FOR USER's INBOX
    imap.openBox("INBOX", true, (err, box) => {
      if (err) res.status(500).send({ error: err });
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };
      imap.search(["ALL"], (searchErr, results) => {
        if (searchErr) res.status(500).send({ error: searchErr });

        // ---------------------- FOR NEW MAIL -----------------------
        // imap.on("mail", (numNewMsgs) => {
        //   // const fetch = imap.seq.fetch(
        //   //   box.messages.total + ":" + (box.messages.total - numNewMsgs + 1),
        //   //   fetchOptions
        //   // );
        //   console.log("NEW MESSAGE");

        //   const fetch = imap.seq.fetch(
        //     box.messages.total - numNewMsgs + 1 + ":" + box.messages.total,
        //     fetchOptions
        //   );

        //   fetch.on("message", (msg, seqno) => {
        //     let messageText = "";

        //     msg.on("body", (stream, info) => {
        //       stream.on("data", (chunk) => {
        //         messageText += chunk.toString("utf8");
        //       });
        //     });

        //     msg.once("end", () => {
        //       // Emit the email content to connected clients
        //       // io.emit("newEmail", { content: messageText });
        //       console.log("MSG END",messageText)
        //       fetchNewEmail(messageText);
        //     });
        //   });
        // });

        // ------------------- END ----------------------

        // ------------------- NEW ----------------------
        // imap.on("mail", (numNewMsgs) => {
        //   console.log("ON `MAIL`");
        //   console.log("NEW MESSAGE");

        //   const fetch = imap.seq.fetch(
        //     box.messages.total - numNewMsgs + 1 + ":" + box.messages.total,
        //     fetchOptions
        //   );

        //   fetch.on("message", (msg, seqno) => {
        //     let data = { header: "", body: "" };

        //     msg.on("body", (stream, info) => {
        //       let messageText = "";

        //       stream.on("data", (chunk) => {
        //         messageText += chunk.toString("utf8");
        //       });

        //       stream.on("end", async () => {
        //         if (info.which !== "TEXT") {
        //           const header = Imap.parseHeader(messageText);
        //           data.header = header;
        //         } else if (info.which === "TEXT") {
        //           data.body = messageText;
        //         }
        //       });
        //     });

        //     msg.once("end", () => {
        //       // Emit the email content to connected clients
        //       // io.emit("newEmail", { content: messageText });
        //       // fetchNewEmail(messageText);
        //       newEmail.push(data);
        //       console.log("MSG END: ", data);
        //     });
        //   });

        //   fetch.on("error", (err) => {
        //     console.log("ERROR in imap fetch", err);
        //   });

        //   fetch.once("end", async () => {
        //     const parseEmail = async () => {
        //       try {
        //         const emailPromises = newEmail.map(async (email) => {
        //           const body = await simpleParser(email.body);
        //           let emailBody;

        //           if (body.text) {
        //             const originalString = body.text;
        //             const endString = body.headerLines[0].line;
        //             const endIndex = originalString.indexOf(endString);
        //             if (endIndex !== -1) {
        //               const truncatedString = originalString.substring(
        //                 0,
        //                 endIndex
        //               );
        //               emailBody = truncatedString;
        //             } else {
        //               emailBody = body.text;
        //             }
        //           } else if (body.headerLines.length > 0) {
        //             // console.log("body: ", body);
        //             emailBody = body.headerLines?.[0].line;
        //           }

        //           const data = { header: email.header, body: emailBody };
        //         });
        //       } catch (error) {
        //         console.log("CATCH ERROR: ", error); // send this in your client
        //       }

        //       parseEmail()
        //         .then(({ emails }) => {
        //           fetchNewEmail(emails);
        //           // imap.end();
        //         })
        //         .catch((error) => {
        //           console.log("ParseEmail ERROR: ", error);
        //           fetchNewEmail(error);
        //           // imap.end();
        //         });
        //     };
        //   });
        // });

        // ------------------ END FOR NEW MAIL ---------------------

        console.log("SEARCH");
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
          console.log("FETCH END");

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
                    // ----------- OLD Promises --------------
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
                    // // --------------- END -------------------

                    // TRY
                    // console.log("ALL EMAIL: ", allEmail);
                    // const emails = await Promise.all(
                    //   mailPromises(allEmail.email)
                    // );
                    // const replies = await Promise.all(
                    //   mailPromises(allEmail.reply)
                    // );

                    // console.log("REPLIES: ", replies);
                    return { emails, replies };
                  } catch (error) {
                    console.log("CATCH: ", error);
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
                    console.log("ERROR 247: ", error);
                    res.status(500).send({
                      error: error,
                      message: "ERROR",
                    });
                    imap.end();
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

    imap.once("end", function () {
      console.log("Connection ended");
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
