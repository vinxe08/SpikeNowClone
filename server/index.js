const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { initializeSocket } = require("./lib/socketManager");

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = initializeSocket(server);

// Import routes
const LoginRoute = require("./routes/Login");
const UserRoute = require("./routes/User");
const ConversationRoute = require("./routes/Conversation");
const GroupConversationRoute = require("./routes/GroupConversation");

// ROUTES
app.use("/user", LoginRoute);
app.use("/api", UserRoute);
app.use("/conversation", ConversationRoute);
app.use("/group", GroupConversationRoute);

let roomData = {};
let requestID;
const users = {};
const socketToRoom = {};
const loggedUsers = [];

const port = process.env.PORT || 3001;

io.on("connection", (socket) => {
  // For user logged in
  socket.on("logged in", (email) => {
    loggedUsers.push(email);
    socket.join(email);

    socket.on("disconnect", () => {
      socket.leave(email);
    });
  });

  // For user's group
  socket.on("group logged in", (groupName) => {
    socket.join(groupName);

    socket.on("disconnect", () => {
      socket.leave(groupName);
    });
  });

  // For creating group
  socket.on("group created", (data) => {
    data.users.map((user) => {
      socket.to(user).emit("new group", data);
    });
  });

  // For selecting email/contact
  socket.on("select_conversation", (id) => {
    socket.join(id);
    socket.emit("previous_video_requests", roomData[id] || []);
  });

  // Send request to recipient
  socket.on("create_request", (data) => {
    requestID = data.id;
    if (!roomData[data.id]) {
      roomData[data.id] = [];
    }
    roomData[data.id].push(data);

    socket.broadcast.to(data.id).emit("send_request", data);
  });

  // When the recipient accepts
  socket.on("on_accept", (data) => {
    socket.broadcast.emit("on_accept", data);

    socket.to(data.id).emit("when_accept", data);
  });

  // When the recipient ignored
  socket.on("ignore_call", (data) => {
    roomData[data.id] = [];
    socket.to(data.id).emit("ignore_response", data);
  });

  // ---------------- WEB SOCKETS FOR VOICE/VIDEO -------------------

  // When the user join
  socket.on("join room", ({ roomID, user }) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      // TODO: REMOVE THIS FOR DEPLOYMENT
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

    socket.emit("all users", usersInThisRoom);
  });

  // When someone join, send their signal to the previous user who join
  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      user: payload.user,
    });
  });

  // Send your signal to the newly joined user
  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  // Use to leave the call and clear your trace/data in server
  socket.on("leave call", () => {
    roomData[requestID] = [];
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id.userID !== socket.id);
      users[roomID] = room;
    }

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

    socket.broadcast.emit("user left", socket.id);

    socket.leave();
  });
});

// Database connection in MongoDB
// const dbConfig = "mongodb://localhost:27017";
// const dbName = "spike-clone";

mongoose
  .connect(`${process.env.MONGO_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log("MONGO ERROR: ", err);
  });

server.listen(port, () => {
  console.log("SERVER IS RUNNING");
});
