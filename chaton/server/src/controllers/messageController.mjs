import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchMessages = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: true, // Include sender details
        receiver: true, // Include receiver details
      },
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderUsername: msg.sender.username, // Extract sender's username
      receiverUsername: msg.receiver.username, // Extract receiver's username
      createdAt: msg.createdAt,
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { senderUsername, receiverUsername, message } = req.body;

  try {
    const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Invalid sender or receiver username" });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message,
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });

    // Emit the new message to the receiver's socket
    io.to(receiver.id).emit("receiveMessage", newMessage);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
