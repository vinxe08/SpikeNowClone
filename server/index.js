const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

app.use(cors());

const server = http.createServer(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Import routes
const EmailRoute = require("./routes/Email");
const LoginRoute = require("./routes/Login");
const UserRoute = require("./routes/User");
const ConversationRoute = require("./routes/Conversation");

// ROUTES
// app.use("/api", EmailRoute);
app.use("/user", LoginRoute);
app.use("/api", UserRoute);
app.use("/conversation", ConversationRoute);

const roomData = {};

io.on("connection", (socket) => {
  console.log("roomData: ", roomData);
  socket.on("select_conversation", (id) => {
    socket.join(id);

    // console.log("ROOM DATA: ", roomData);
    socket.emit("previous_video_requests", roomData[id] || []);
    // console.log("JOIN: ", id);
  });

  socket.on("send_email", (id, data) => {
    socket.to(id).emit("receive_email", data);
  });

  // NEW
  socket.on("create_request", (data) => {
    // console.log("create_request", data);

    if (!roomData[data.id]) {
      roomData[data.id] = [];
    }
    roomData[data.id].push(data);

    socket.broadcast.to(data.id).emit("send_request", data);
  });

  socket.on("on_accept", (data) => {
    socket.broadcast.emit("on_accept", data);

    socket.to(data.id).emit("when_accept", data);
  });

  // callUser
  socket.on("video_request", (data) => {
    socket.to(data.id).emit("receive_request", {
      id: data.id,
      // name: data.name,
      email: data.email,
      type: data.type,
      signal: data.signalData,
    });
    // console.log("video_request: ", data);
  });

  socket.on("ignore_call", (data) => {
    roomData[data.id] = [];
    // add a an ignore functionality for Contact.jsx
    socket.to(data.id).emit("ignore_response", data);
  });

  // answerCall
  socket.on("accept_call", (data) => {
    // console.log("accept_call", data);
    socket.to(data.to).emit("call_accepted", data);
  });

  socket.on("end_call", (data) => {
    socket.to(data.id).emit("end_call", data);
  });

  // GITHUB ---------------------
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("disconnect", () => {});
});

// Database connection in MongoDB
const dbConfig = "mongodb://localhost:27017";
const dbName = "spike-clone";

mongoose.connect(`${dbConfig}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
