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
const GroupConversationRoute = require("./routes/GroupConversation");

// ROUTES
// app.use("/api", EmailRoute);
app.use("/user", LoginRoute);
app.use("/api", UserRoute);
app.use("/conversation", ConversationRoute);
app.use("/group", GroupConversationRoute);

let roomData = {};
let requestID;
const users = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("select_conversation", (id) => {
    socket.join(id);
    socket.emit("previous_video_requests", roomData[id] || []);
  });

  socket.on("send_email", (id, data) => {
    socket.to(id).emit("receive_email", data);
  });

  // NEW
  socket.on("create_request", (data) => {
    requestID = data.id;
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

  // // POV: CALLER - NOT IN USE
  // socket.on("video_request", (data) => {
  //   users[data.id] = [
  //     {
  //       socketID: socket.id,
  //       id: data.id,
  //       email: data.email,
  //       type: data.type,
  //       signal: data.signalData,
  //       peer: data.peer,
  //       stream: data.stream,
  //     },
  //   ];

  //   // NOT IN USE
  //   socket.to(data.id).emit("receive_request", users[data.id]);
  // });

  // IN USE
  socket.on("ignore_call", (data) => {
    roomData[data.id] = [];
    // IN USE
    socket.to(data.id).emit("ignore_response", data);
  });

  // // NOT IN USE
  // // answerCall | POV: Receiver
  // socket.on("accept_call", (data) => {
  //   users[data.to].push({
  //     socketID: socket.id,
  //     callee: data.callee,
  //     signal: data.signal,
  //     to: data.to,
  //   });

  //   // NOT IN USE
  //   socket.to(data.to).emit("call_accepted", { data, users });
  //   // NOT IN USE
  //   socket.to(data.to).emit("on_join", users);
  // });

  // socket.on("end_call", (data) => {
  //   roomData = {};
  //   socket.to(data.id).emit("end_call", data);
  // });

  // ---------------- WEB SOCKETS FOR VOICE/VIDEO -------------------
  // POV: USER
  socket.on("join room", ({ roomID, user }) => {
    console.log("JOIN ROOM: ", roomID, socket.id, users); // users aren't remove all the data
    if (users[roomID]) {
      const length = users[roomID].length;
      // REMOVE THIS FOR FINAL
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push({ userID: socket.id, user });
    } else {
      users[roomID] = [{ userID: socket.id, user }];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(
      (data) => data.userID !== socket.id
    );

    // USER TO RECEIVER
    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      user: payload.user,
    });
  });

  socket.on("returning signal", (payload) => {
    console.log("returning signal", payload.callerID);
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  // ISSUE: LEAVE CALL ARE NOT CLEANING ALL THE DATA. OLD DATA ARE STILL SAVED.
  socket.on("leave call", () => {
    roomData[requestID] = [];
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id.userID !== socket.id);
      console.log("ROOM: ", room);
      users[roomID] = room;
    }
    console.log("leave call", users[roomID], users);

    socket.broadcast.emit("user left", socket.id);
  });

  // TRY TO COPY THIS FOR socket.emit("end_call")
  socket.on("disconnect", () => {
    roomData[requestID] = [];
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id.userID !== socket.id);
      users[roomID] = room;
    }
    console.log("DISCONNECT", users[roomID], users);

    socket.broadcast.emit("user left", socket.id);
  });
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
