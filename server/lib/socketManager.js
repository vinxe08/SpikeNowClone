const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.SERVER_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  return io;
}

const getIncomingEmail = (mail, user) => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }
  const groupReceiver = mail[0].header.to[0].split(", ");
  const getReceiver = mail[0].header.to[0].match(/<([^>]+)>/)?.[1];

  if (groupReceiver.length > 1) {
    io.to(`${mail[0].header.subject[0]} - ${user}`).emit("new email", mail);
  } else {
    io.to(getReceiver || mail[0].header.to[0]).emit("new email", mail);
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
