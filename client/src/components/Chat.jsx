import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import "./Chat.css";
import { BsSend } from "react-icons/bs";
import { CgArrowLeftR } from "react-icons/cg";

function Chat() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const { username, socket } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();

  // Sends message in Database and also trigger the Socket.io
  const sendMessage = async () => {
    if (currentMessage !== "" && username !== "") {
      const messageData = {
        room: id,
        username: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      const result = await axios({
        method: "POST",
        url: "http://localhost:3001/room/addMessage",
        data: messageData,
      });

      // SOCKET IO
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  const getRoomData = async () => {
    if (id) {
      const result = await axios({
        method: "POST",
        url: "http://localhost:3001/room/retrieve",
        data: {
          roomID: id,
        },
      });

      if (result) {
        const filteredResult = result.data.users.filter(
          (u) => u.message !== ""
        );
        setMessageList(filteredResult);
      }
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  useEffect(() => {
    getRoomData();
  }, []);

  // if(!username){
  //   navigate("/")
  // }

  return (
    <div className="container">
      <div className="chatHeader">
        <button onClick={() => navigate("/")} className="chatButton">
          <CgArrowLeftR size="3rem" />
        </button>
        <p className="chatTitle">Live Chat: {username}</p>
      </div>
      <div className="chatWindow">
        {/* Filter the data that has message and Map */}
        {messageList.map((messageContent) => (
          <div
            className={`messageContainer ${
              username === messageContent.username ? "user" : null
            }`}
            key={messageContent._id}
          >
            <h1 className="username">{messageContent.username}</h1>
            <p
              className={`messageText ${
                username === messageContent.username ? "messageUserText" : null
              }`}
            >
              {messageContent.message}
            </p>
          </div>
        ))}
      </div>
      <div className="chatFooter">
        <input
          className="chatField"
          type="text"
          value={currentMessage}
          placeholder="Write Text..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button className="sendButton" onClick={sendMessage}>
          <BsSend size="1.5rem" style={{ backgroundColor: "transparent" }} />
        </button>
      </div>
    </div>
  );
}

export default Chat;
