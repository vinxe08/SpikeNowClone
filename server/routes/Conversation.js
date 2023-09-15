const express = require("express");
const router = express.Router();
const nodeMailer = require("nodemailer");

const CreateServices = require("../services/Conversation/Create");
const UpdateServices = require("../services/Conversation/Update");
const RetrieveServices = require("../services/Conversation/Retrieve");
const RetrieveGroupServices = require("../services/GroupConversation/Retrieve");

router.post("/create", async (req, res) => {
  const result = await CreateServices(req.body);
  res.status(200).send({ status: true, response: result });
});

router.post("/reply", async (req, res) => {
  const result = await UpdateServices(req.body);
  res.status(200).send({ status: true, data: result });
});

router.post("/send", async (req, res) => {
  const {
    email,
    smtp_server,
    smtp_port,
    password,
    receiver,
    message,
    subject,
  } = req.body;

  const main = async () => {
    const transporter = nodeMailer.createTransport({
      host: smtp_server,
      port: smtp_port, // SMTP PORT
      secure: false, // true for 465/google, false for other ports
      auth: {
        user: email,
        pass: password,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `<${email}>`,
        to: Array.isArray(receiver) ? receiver.join(", ") : receiver,
        cc: Array.isArray(receiver) ? receiver.join(", ") : receiver,
        subject: subject,
        text: message,
      });

      if (info.messageId) {
        res.status(200).send({
          message: "Successfully send",
        });
      }
    } catch (error) {
      res.status(500).send({ error: error });
    }
  };

  main();
});

router.post("/retrieve", async (req, res) => {
  const result = await RetrieveServices(req.body);
  const groupResult = await RetrieveGroupServices(req.body);
  res.status(200).send([...result, ...groupResult.group]);
});

module.exports = router;
