const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Your socket.io logic here

  return io;
}

const getIncomingEmail = (email) => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }
  // io.to("new email").emit(email)
  const getReceiver = email.header.to[0].match(/<([^>]+)>/)?.[1];
  console.log("GET INCOMING EMAIL: ", email, getReceiver);
  io.to(getReceiver).emit("new email", email);
};

// NOT USING
function getSocketIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }
  return io;
}

module.exports = {
  initializeSocket,
  getSocketIO,
  getIncomingEmail,
};
