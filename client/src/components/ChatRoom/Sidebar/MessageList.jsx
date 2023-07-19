import React from "react";
import "./MessageList.css";
import TimeAgo from "react-timeago";
import { useDispatch, useSelector } from "react-redux";
import { getEmail } from "../../../features/email/emailSlice";
import { useOutletContext } from "react-router-dom";

function MessageList({ email }) {
  const emailState = useSelector((state) => state.emailReducer);
  const { socket } = useOutletContext();
  const dispatch = useDispatch();

  const truncate = (paragraph, maxLength) => {
    if (paragraph?.length <= maxLength) {
      return paragraph; // No truncation needed
    }
    return paragraph?.slice(0, maxLength) + "...";
  };

  // Displays Conversation
  const dispatchEmail = async () => {
    // Check's if this user is with recipients.
    const recipients = emailState.recipients.filter((recipient) =>
      recipient.users.includes(
        email[0].header.from[0].email && email[0].header.to[0].email
      )
    );

    dispatch(getEmail(email));
    if (recipients.length > 0) {
      // Socket.io
      socket.emit("select_conversation", recipients[0]?._id);
      // console.log("MessageList: ", recipients[0]?._id);
    } else {
      // CREATE CONVERSATION
      try {
        const response = await fetch(
          "http://localhost:3001/conversation/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email[0].header.to[0].email || email[0].header.to[0], //
              receiver:
                email[0].header.from[0].email || email[0].header.from[0],
            }),
          }
        );
        const result = await response.json();
        // console.log("MessageList: TRY", email);
        socket.emit("select_conversation", recipients[0]?._id);
      } catch (error) {
        console.log("MessageList: error ", error);
      }
    }
  };

  // console.log("MessageList: ", email);
  return (
    <div onClick={dispatchEmail} className="MessageList">
      <div className="message__avatar">
        {email[0]?.header?.from[0]?.name?.[0] ||
          email[0]?.header?.from.map((d) => d[0])}
      </div>
      <div className="message__sender">
        <div className="message_name">
          <h1 className="name">
            {email[0]?.header.from[0]?.name || email[0]?.header?.from[0]}
          </h1>
          <h1 className="timestamp">
            {/* <TimeAgo date={recipient[0].createdDateTime} /> */}
          </h1>
        </div>
        <div className="message__subject">
          <h1 className="subject">
            {truncate(email[0]?.header.from[0].email, 40)}
          </h1>
          {/* <h1 className="message__count">99</h1> */}
        </div>
        <h1 className="messages">{truncate(email[0]?.body?.[0], 40)}</h1>
      </div>
    </div>
  );
}

export default MessageList;
