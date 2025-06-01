// socket.js
// const socketIo = require("socket.io");
const { Server } = require("socket.io");
let io;
function initSocket(server) {
  //   io = socketIo(server);
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  console.log("findng connection...");
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("joinReception", (receptionId) => {
      socket.join(receptionId);
      console.log(`Socket ${socket.id} joined room ${receptionId}`);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

function getIo() {
  return io;
}

module.exports = {
  initSocket,
  getIo,
};

