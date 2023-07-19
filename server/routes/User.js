const express = require("express");
const router = express.Router();
const Imap = require("imap"),
  inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;

const CreateServices = require("../services/User/Create");
const RecipientsService = require("../services/User/Retrieve");
const GetUserService = require("../services/User/GetUser");

router.post("/users", async (req, res) => {
  const { imap_server, imap_port, email, password } = req.body;

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
    imap.openBox("INBOX", false, (err, mailbox) => {
      if (err) res.status(500).send({ error: err });
      // console.log("Mailbox: ", mailbox.messages);
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };

      imap.search(["ALL"], (searchErr, results) => {
        if (searchErr) res.status(500).send({ error: searchErr });

        const emailList = [];
        const messageCount = results.length;
        let processedCount = 0;

        // results.forEach((uid) => {
        const fetch = imap.fetch(results, fetchOptions);
        fetch.on("message", (msg, seqno) => {
          let data = { header: "", body: "" };

          msg.on("body", (stream, info) => {
            let buffer = "";
            // console.log("INFO: ", info);
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });

            stream.on("end", async () => {
              // console.log("STREAM: END");
              if (info.which !== "TEXT") {
                // console.log("STREAM: END-IF");
                const header = Imap.parseHeader(buffer);
                data.header = header;
              } else if (info.which === "TEXT") {
                // console.log("STREAM: END-ELSE");
                // console.log(buffer.includes("text/html"));
                // const email = simpleParser(buffer);
                // const parsedEmail = await email;
                // if (parsedEmail) {
                //   data.body = parsedEmail.textAsHtml;
                // }
                // // console.log("Buffer: ", buffer);
                // const substr = buffer.includes("text/html");
                // substr ? (data.body = buffer) : null;
                data.body = buffer;

                // simpleParser(buffer, (err, parsed) => {
                //   if (err) {
                //     console.log("ERROR", err);
                //   }
                //   data.body = parsed.text;
                // });
              }
            });

            // // !!! This is async: Some Data may not be retrieve
            // simpleParser(stream, async (err, parsed) => {
            //   if (err) {
            //     console.log("ERROR IN PARSER: ", err);
            //   }
            //   // const {from, subject, textAsHtml, text} = parsed;
            //   // console.log("PARSED: ", parsed.headers);
            //   // console.log("PARSED: ", parsed);
            //   // emailList.push(parsed);
            //   /* Make API call to save the data
            //        Save the retrieved data into a database.
            //        E.t.c
            //     */
            //   if (info.which === "TEXT") {
            //     data.body = parsed.text;
            //   } else {
            //     // const header = Imap.parseHeader(parsed);
            //     data.header = parsed.headerLines;
            //   }
            // });
          });

          // console.log("MSG");

          msg.on("attributes", function (attrs) {
            const attributes = attrs;
            // console.log("ATTRS", attributes);

            // const Index = attrs.struct[0].params.boundary;
            // console.log("ATTR: Index - ", Index);
            // const regexPattern = `/${Index}\r?\n([\s\S]+?)\r?\n${Index}/`;
            // const regex = new RegExp(regexPattern);
            // const match = data.body.match(regex);

            // // TODO: RETURN SHOULD BE CLEAN text/html ONLY
            // const pattern =
            //   /Content-Type: text\/html; charset=utf-8[\s\S]+?--[\w-]+?--/;
            // const matches = email.match(pattern);
            // console.log("MATCH: ", matches);
            // if (matches && matches.length > 0) {
            //   const extractedContent = matches[0];
            //   // console.log(extractedSentences);
            //   data.body = extractedContent;
            // }

            // // console.log("msg: ATTR", startIndex);
            // // if (startIndex !== -1) {
            // // var substring = data.body.substring(startIndex); // Extract substring from startIndex to the end
            // //  console.log(substring);
            // // } else {
            // //   console.log("The word 'App' was not found in the paragraph.");
            // // }
            // attrs.struct.map((data) => console.log("DATA: ", data[0]?.type));
            // attrs.struct.filter(
            //   (data) => data[0]?.type === "text" && data[0]?.subtype === "html"
            // );
            //.map((item) => console.log("DATA: ", data));
            // console.log("DATA: ", data);
          });

          msg.on("end", async function () {
            // const newBodyPromise = simpleParser(data.body);
            // const newBody = await newBodyPromise;
            // data.body = newBody.textAsHtml;
            // if (newBody) {
            // console.log("NEW BODY");
            emailList.push(data);
            // processedCount++;
            // }
            // emailList.push(data);
          });
        });

        fetch.once("end", async () => {
          // socket.emit('newEmail', emailList);
          // console.log("FETCH END: ", processedCount, messageCount);
          // if (processedCount === messageCount) {
          //   console.log("IF");

          const user = await CreateServices(req.body);
          const parseEmail = async () => {
            // console.log("1st", emailList);
            const emails = await Promise.all(
              emailList.map(async (email) => {
                // console.log("EMAILS: ", email.header);
                const body = await simpleParser(email.body);
                const data = { header: email.header, body: body.text };
                return data;
              })
            );

            return emails;
            // console.log("EMAILS: ", emails);
          };

          parseEmail()
            .then((emails) => {
              res.status(200).send({
                email: emails,
                error: user.error,
                userExist: user.userExist,
              });

              imap.end();
            })
            .catch((error) => {
              // console.log(error);
              res.status(500).send({
                error: error,
                message: "ERROR",
              });
            });
          // }

          // imap.end();
        });
        // });
      });
    });
  });

  // Map all the emailList -> get email.body -> simpleParser(email.body) -> if( simpleParser ) -> rese.send()
  // const parseEmail = async() => {
  //   const emailLength = emailList.length
  //   const emails = emailList.map( async (email) => {
  //     let parsed = await simpleParser(email.body);
  //     parsed ?
  //   })
  // }
});

router.post("/getUser", async (req, res) => {
  try {
    const result = await GetUserService(req.body);
    res.status(200).send({ status: true, data: result });
  } catch (error) {
    console.log("ERROR: ", error);
    res.status(500).send({ error });
  }
});

router.post("/recipients", async (req, res) => {
  const result = await RecipientsService(req.body);
  res.status(200).send({ status: true, data: result });
});

module.exports = router;
