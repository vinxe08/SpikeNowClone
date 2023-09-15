import React from "react";
import "./MessageList.css";
import TimeAgo from "react-timeago";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmail,
  setReciever,
  setRecipient,
  setToggle,
} from "../../../features/email/emailSlice";
import { useOutletContext } from "react-router-dom";
import { HiUserGroup } from "react-icons/hi";
import { Toast } from "../../../lib/sweetalert";
import { truncate } from "../../../lib/truncate";

function MessageList({ email }) {
  const emailState = useSelector((state) => state.emailReducer);
  const { socket } = useOutletContext();
  const dispatch = useDispatch();

  // FOR EMAIL THAT HAS TYPE:GROUP
  const hasType = email.filter((item) => item.header.type);

  const messageNotFromUser =
    email[0]?.header.from[0]?.email !== emailState.user.email &&
    email[0]?.header.from[0]?.name !== emailState.user.email &&
    email[0]?.header?.from[0] !== emailState.user.email;

  // Displays Conversation
  const dispatchEmail = async () => {
    dispatch(getEmail(email));
    dispatch(setToggle("single"));

    // Check if it is group email and has an id
    if (email[0]?.data?._id) {
      socket.emit("select_conversation", email[0]?.data?._id);
      dispatch(
        setReciever([
          {
            _id: email[0]?.data?._id,
            users: [email[0].header.from[0].email, email[0].header.to[0].email],
          },
        ])
      );
      dispatch(
        setRecipient([
          {
            _id: email[0]?.data?._id,
            users: [email[0].header.from[0].email, email[0].header.to[0].email],
          },
        ])
      );
    } else {
      const recipients = emailState.recipients.filter(
        (recipient) =>
          recipient.users.includes(
            email[0].header.from[0].email || email[0].header.from[0]
          ) &&
          recipient.users.includes(
            email[0].header.to[0].email || email[0].header.to[0]
          )
      );

      const userRecipient = emailState.recipients.filter(
        (recipient) =>
          recipient.users.includes(emailState.user.email) &&
          recipient.users.includes(
            email[0].header.to[0].email || email[0].header.to[0]
          )
      );

      if (recipients.length > 0) {
        dispatch(setReciever(recipients));
        socket.emit("select_conversation", recipients[0]?._id);
      } else if (userRecipient.length > 0) {
        dispatch(setRecipient(userRecipient));
        dispatch(setReciever(userRecipient));
        socket.emit("select_conversation", userRecipient[0]?._id);
      } else {
        // CREATE CONVERSATION
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CONVERSATION_CREATE}`,
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
          if (result) {
            dispatch(setRecipient([result.response.data]));
            dispatch(setReciever([result.response.data]));
            socket.emit("select_conversation", result.response.data._id);
          }
        } catch (error) {
          console.log(error);
          Toast.fire({
            icon: "error",
            title: "Error. Please try again",
          });
        }
      }
    }
  };

  return (
    <div onClick={dispatchEmail} className="MessageList">
      {hasType.length > 0 ? (
        <div className="message__avatarIcon">
          <HiUserGroup />
        </div>
      ) : (
        <div className="message__avatar">
          {email[0]?.header?.from[0]?.name?.[0] ||
            email[0]?.header?.from.map((d) => d[0])}
        </div>
      )}
      <div className="message__sender">
        <div className="message_name">
          <h1 className="name">
            {hasType.length > 0
              ? hasType[0].header.subject[0].replace(
                  `: ${hasType[0].data._id}`,
                  ""
                )
              : email[0]?.header.from[0]?.name ||
                email[0]?.header.from[0]?.email ||
                email[0]?.header?.from[0]}
          </h1>
        </div>
        <div className="message__subject">
          <h1 className="subject">
            {truncate(
              messageNotFromUser
                ? email?.[0]?.header.from?.[0].email
                : email?.[0]?.header.to?.[0].email
                ? email?.[0]?.header.to?.[0].email
                : hasType[0].header.subject[0].replace(
                    `: ${hasType[0].data._id}`,
                    ""
                  ),
              40
            )}{" "}
          </h1>
        </div>
        <h1 className="messages">
          {truncate(
            email[0]?.body ||
              email.filter((item) => item.body)[0]?.body ||
              "No email",
            40
          )}
        </h1>
      </div>
    </div>
  );
}

export default MessageList;
