const express = require("express");
const router = express.Router();
const nodeMailer = require("nodemailer");

const CreateServices = require("../services/Conversation/Create");
const UpdateServices = require("../services/Conversation/Update");
const RetrieveServices = require("../services/Conversation/Retrieve");

router.post("/create", async (req, res) => {
  const result = await CreateServices(req.body);
  res.status(200).send({ status: true, response: result });
});

router.post("/reply", async (req, res) => {
  const result = await UpdateServices(req.body);
  res.status(200).send({ status: true, data: result });
});

router.post("/send", async (req, res) => {
  const { email, smtp_server, smtp_port, password, receiver, message } =
    req.body;

  try {
    const main = async () => {
      const transporter = nodeMailer.createTransport({
        host: smtp_server,
        port: smtp_port, // SMTP PORT
        secure: false, // true for 465, false for other ports
        auth: {
          user: email,
          pass: password,
        },
      });

      const info = await transporter.sendMail({
        from: `<${email}>`,
        to: receiver,
        subject: "", // Make it dynamic
        text: message,
      });

      console.log("Message send: ", info.messageId);
      // For 1st time message: Store the info.messageId in DB || you can use this for socket id for private ||
      // add this in MessageList(If the user click message, check if they already have info.messageId in DB(if user's email is in DB together with the messagage select email) -> get the info.messageId )
      if (info.messageId) {
        // const result = await CreateServices({
        //   email,
        //   receiver,
        //   messageId: info.messageId,
        // });

        res.status(200).send({
          message: "Successfully send",
          // messageId: info.messageId,
        });
      }
    };

    main();
  } catch (error) {
    res.status(500).send({ error: error });
    console.log("ERROR: ", error);
  }
});

router.post("/retrieve", async (req, res) => {
  const result = await RetrieveServices(req.body);
  res.status(200).send(result);
});

module.exports = router;
