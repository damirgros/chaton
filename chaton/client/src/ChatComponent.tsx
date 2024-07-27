import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

interface Message {
  id: string;
  content: string;
  senderUsername: string;
  receiverUsername: string;
  createdAt: string;
}

interface ChatComponentProps {
  userUsername: string;
}

const socket = io("http://localhost:5000");

const ChatComponent: React.FC<ChatComponentProps> = ({ userUsername }) => {
  const [message, setMessage] = useState<string>("");
  const [recipientUsername, setRecipientUsername] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial messages for the user from the server
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${userUsername}`);
        setMessages(response.data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for sendMessageError
    socket.on("sendMessageError", ({ message }: { message: string }) => {
      alert(message);
    });

    // Cleanup the listener on component unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("sendMessageError");
    };
  }, [userUsername]);

  const sendMessage = async () => {
    if (!message || !recipientUsername) {
      alert("Please enter both a recipient username and a message.");
      return;
    }

    try {
      // Send the message to the server
      await axios.post("/api/messages/send", {
        senderUsername: userUsername,
        receiverUsername: recipientUsername,
        message,
      });

      // Emit the message to the socket
      socket.emit("sendMessage", {
        senderUsername: userUsername,
        receiverUsername: recipientUsername,
        message,
      });

      setMessage(""); // Clear message input field
    } catch (e) {
      console.log((e as Error).message);
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Chat</h2>
      <div>
        <h3>Messages</h3>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="message">
              <p>
                <strong>From:</strong> {msg.senderUsername}
              </p>
              <p>
                <strong>To:</strong> {msg.receiverUsername}
              </p>
              <p>
                <strong>Message:</strong> {msg.content}
              </p>
              <p>
                <strong>Received At:</strong> {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No messages found</p>
        )}
      </div>
      <div>
        <input
          type="text"
          placeholder="Recipient Username"
          value={recipientUsername}
          onChange={(e) => setRecipientUsername(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <br />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
