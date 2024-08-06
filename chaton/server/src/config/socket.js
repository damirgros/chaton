import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on(
      "sendMessage",
      async ({ id, senderUsername, content, receiverUsername, createdAt }) => {
        try {
          const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
          const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

          if (!sender || !receiver) {
            socket.emit("sendMessageError", { message: "Invalid sender or receiver username" });
            return;
          }

          const newMessage = await prisma.message.create({
            data: {
              id,
              content,
              senderId: sender.id,
              receiverId: receiver.id,
              createdAt,
            },
          });

          io.emit("receiveMessage", {
            id: newMessage.id,
            content: newMessage.content,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
            createdAt: newMessage.createdAt,
          });
        } catch (error) {
          socket.emit("sendMessageError", { message: "Internal server error." });
        }
      }
    );
  });
};

export default initializeSocket;
