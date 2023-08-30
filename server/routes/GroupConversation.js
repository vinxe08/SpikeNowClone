const express = require("express");
const router = express.Router();

const CreateServices = require("../services/GroupConversation/Create");
const RetrieveServices = require("../services/GroupConversation/Retrieve");
const SendServices = require("../services/GroupConversation/Send");

router.post("/create", async (req, res) => {
  const result = await CreateServices(req.body);
  res.status(200).send({ status: true, response: result });
});

router.post("/retrieve", async (req, res) => {
  const result = await RetrieveServices(req.body);
  res.status(200).send({ status: true, ...result });
});

router.post("/send", async (req, res) => {
  const result = await SendServices(req.body);
  res.status(200).send({ status: true, ...result });
});

module.exports = router;
