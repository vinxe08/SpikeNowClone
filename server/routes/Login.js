const express = require("express");
const router = express.Router();

// Services
const CreateServices = require("../services/Login/Create");

router.post("/login", async (req, res) => {
  const result = CreateServices(req.body);
  if (result) {
    res
      .status(200)
      .send({ status: true, message: "Welcome to Spike Now Clone" });
  } else {
    res.status(500).send({ status: false, message: "Login Failed" });
  }
});

module.exports = router;
