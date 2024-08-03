import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatProps, User } from "../types/types";

const socket = io("http://localhost:5000");

const Chat: React.FC<ChatProps> = ({ userUsername, userId }) => {
  const [message, setMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ users: User[] }>(`/api/user/${userId}/followed`);
        setFollowedUsers(response.data.users);
      } catch (err) {
        setError("Failed to fetch followed users");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedUsers();
  }, [userId]);

  useEffect(() => {
    const handleMessageReceive = (newMessage: Message) => {
      console.log("Received message: ", newMessage); // Debugging log
      if (
        newMessage.senderUsername === selectedUser?.username ||
        newMessage.receiverUsername === userUsername
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receiveMessage", handleMessageReceive);

    return () => {
      socket.off("receiveMessage", handleMessageReceive);
    };
  }, [selectedUser, userUsername]);

  const fetchMessages = async (recipientUsername: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/messages/${userUsername}/${recipientUsername}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user.username);
  };

  const sendMessage = async () => {
    if (!message || !selectedUser) {
      alert("Please enter a message and select a user.");
      return;
    }

    try {
      const newMessage = {
        id: uuidv4(),
        senderUsername: userUsername,
        receiverUsername: selectedUser.username,
        content: message,
        createdAt: new Date().toISOString(),
      };

      socket.emit("sendMessage", newMessage);
      setMessages((prev) => [...prev, newMessage]); // Update local state immediately
      setMessage("");
    } catch {
      setError("Message failed to emit.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {error && <p>{error}</p>}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>Followed Users</h3>
        <ul>
          {followedUsers.length > 0 ? (
            followedUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => handleUserClick(user)}
                style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #eee" }}
              >
                {user.username}
              </li>
            ))
          ) : (
            <p>No followed users found</p>
          )}
        </ul>
      </div>
      <div style={{ width: "70%", padding: "10px" }}>
        {selectedUser ? (
          <>
            <h3>Conversation with {selectedUser.username}</h3>
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="message"
                    style={{ padding: "10px", borderBottom: "1px solid #eee" }}
                  >
                    <p>
                      <strong>{msg.senderUsername}:</strong> {msg.content}
                    </p>
                    <p>
                      <small>{new Date(msg.createdAt).toLocaleString()}</small>
                    </p>
                  </div>
                ))
              ) : (
                <p>No messages found</p>
              )}
            </div>
            <div>
              <textarea
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "100%", height: "100px", marginTop: "10px" }}
              />
              <button onClick={sendMessage} style={{ marginTop: "10px" }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
