const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  return io;
}

const getIncomingEmail = (mail, user) => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }
  const groupReceiver = mail.header.to[0].split(", ");
  const getReceiver = mail.header.to[0].match(/<([^>]+)>/)?.[1];

  if (groupReceiver.length > 0) {
    // This will trigger twice because two user has new email
    io.to(`${mail.header.subject[0]} - ${user}`).emit("new email", mail);
  } else {
    io.to(getReceiver || mail.header.to[0]).emit("new email", mail);
  }
};

// For Connection Error
const connectionError = (err) => {
  io.to("connection error").emit(err);
};

module.exports = {
  initializeSocket,
  getIncomingEmail,
  connectionError,
};
