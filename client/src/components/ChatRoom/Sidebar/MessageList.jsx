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

function MessageList({ email }) {
  const emailState = useSelector((state) => state.emailReducer);
  const { socket } = useOutletContext();
  const dispatch = useDispatch();

  // console.log("USER: ", emailState.user.email);

  // FOR EMAIL THAT HAS TYPE:GROUP
  const hasType = email.filter((item) => item.header.type);

  const messageNotFromUser =
    email[0]?.header.from[0]?.email !== emailState.user.email &&
    email[0]?.header.from[0]?.name !== emailState.user.email &&
    email[0]?.header?.from[0] !== emailState.user.email;

  const truncate = (paragraph, maxLength) => {
    if (paragraph?.length <= maxLength) {
      return paragraph; // No truncation needed
    }
    return paragraph?.slice(0, maxLength) + "...";
  };

  // Displays Conversation
  const dispatchEmail = async () => {
    // ISSUE!!!: if it is for group, VIDEO/VOICE call not working

    // console.log("EMAIL: ", email);
    // console.log("emailState: ", emailState); // recipients are not the same
    dispatch(getEmail(email)); // Dispatch the email and display
    dispatch(setToggle("single"));

    // Check if it is group email and has an id
    if (email[0]?.data?._id) {
      console.log("IF select_conversation: ", email[0]?.data?._id);
      socket.emit("select_conversation", email[0]?.data?._id);
      dispatch(
        setReciever([
          {
            _id: email[0]?.data?._id,
            users: [email[0].header.from[0].email, email[0].header.to[0].email],
          },
        ])
      );
      // ADDITIONAL
      dispatch(
        setRecipient([
          {
            _id: email[0]?.data?._id,
            users: [email[0].header.from[0].email, email[0].header.to[0].email],
          },
        ])
      );
    } else {
      // RECIPIENTS IS ALREADY FOR USER. -> TRY: USE THE RECIPIENT ONLY NOT THE USER
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
      console.log("ELSE select_conversation: ", recipients, userRecipient);

      // --------------------------- ISSUE ---------------------------
      // ISSUE: Not specifically for its own message.
      // TRY: Find another solution for that is unique but the same id with sender for each message
      // SOLUTION 1: TRY TO MODIFY AND ADD THE SENDER THE EMAIL IN CONTACT LIST. -> NOT WORKING BEC. IT WILL BE UNIQUE IN SENDER & CALLER -> CATN USE AS A ROOM ID
      if (recipients.length > 0) {
        // console.log(
        //   "ELSE IF select_conversation: ",
        //   recipients[0]?._id,
        //   recipients
        // );
        console.log("IF: ", recipients[0]?._id);
        dispatch(setReciever(recipients));
        // Socket.io
        socket.emit("select_conversation", recipients[0]?._id); // ERROR: recipient may be to many. id !== room id
      } else if (userRecipient.length > 0) {
        console.log("ELSE IF: ", userRecipient[0]?._id);
        dispatch(setRecipient(userRecipient));
        dispatch(setReciever(userRecipient));
        socket.emit("select_conversation", userRecipient[0]?._id);
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
          console.log("MessageList: TRY", result.response.data);
          if (result) {
            dispatch(setRecipient([result.response.data]));
            dispatch(setReciever([result.response.data]));
            socket.emit("select_conversation", result.response.data._id);
          }
        } catch (error) {
          console.log("MessageList: error ", error);
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
          <h1 className="timestamp">
            {/* <TimeAgo date={recipient[0].createdDateTime} /> */}
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
          {/* <h1 className="message__count">99</h1> */}
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
