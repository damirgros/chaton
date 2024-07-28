import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("sendMessage", async ({ senderUsername, receiverUsername, message }) => {
      try {
        const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
        const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

        if (!sender || !receiver) {
          socket.emit("sendMessageError", { message: "Invalid sender or receiver username" });
          return;
        }

        const newMessage = await prisma.message.create({
          data: {
            content: message,
            senderId: sender.id,
            receiverId: receiver.id,
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
        console.error("Error sending message:", error);
        socket.emit("sendMessageError", { message: "Internal server error." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
