import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchMessages = async (req, res) => {
  const { username1, username2 } = req.params;
  try {
    const [user1, user2] = await prisma.user.findMany({
      where: {
        username: { in: [username1, username2] },
      },
    });

    if (!user1 || !user2) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1.id, receiverId: user2.id },
          { senderId: user2.id, receiverId: user1.id },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderUsername: msg.sender.username,
      receiverUsername: msg.receiver.username,
      createdAt: msg.createdAt,
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUsersWithMessageHistory = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { messagesReceived: { some: { senderId: user.id } } },
          { messagesSent: { some: { receiverId: user.id } } },
        ],
      },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
