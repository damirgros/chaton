import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Message, ChatComponentProps, User } from "../types/types";

const socket = io("http://localhost:5000");

const ChatComponent: React.FC<ChatComponentProps> = ({ userUsername, userId }) => {
  const [message, setMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch followed users
    const fetchFollowedUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ users: User[] }>(`/api/user/${userId}/followed`);
        console.log("Fetched followed users:", response.data.users);
        setFollowedUsers(response.data.users);
      } catch (err) {
        console.error("Failed to fetch followed users:", err);
        setError("Failed to fetch followed users");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedUsers();

    // Set up socket listeners
    socket.on("receiveMessage", (newMessage) => {
      if (
        newMessage.senderUsername === selectedUser?.username ||
        newMessage.receiverUsername === userUsername
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userUsername, selectedUser?.username]);

  const fetchMessages = async (recipientUsername: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/${userUsername}/${recipientUsername}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
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
      await axios.post("/api/messages/send", {
        senderUsername: userUsername,
        receiverUsername: selectedUser.username,
        message,
      });

      socket.emit("sendMessage", {
        senderUsername: userUsername,
        receiverUsername: selectedUser.username,
        message,
      });

      setMessage("");
    } catch (e) {
      console.log((e as Error).message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
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

export default ChatComponent;
