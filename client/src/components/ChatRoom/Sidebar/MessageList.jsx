import React, { useEffect, useState } from "react";
import "./MessageList.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getEmail,
  removeNotification,
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
  const [newNotif, setNewNotif] = useState(null);
  const [socketRoom, setSocketRoom] = useState(null);

  // FOR EMAIL THAT HAS TYPE:GROUP
  const hasType = email.filter((item) => item.header.type);

  const messageNotFromUser =
    email[0]?.header.from[0]?.email !== emailState.user.email &&
    email[0]?.header.from[0]?.name !== emailState.user.email &&
    email[0]?.header?.from[0] !== emailState.user.email;

  const joinSocketRoom = (id) => {
    if (socketRoom) {
      socket.emit("leave convo", socketRoom); // socketRoom is the old convo -> go & leave convo

      socket.on("on leave", (message) => {
        // add the new socket
        socket.emit("select_conversation", id);
      });
    } else {
      socket.emit("select_conversation", id);
    }

    setSocketRoom(id);
  };

  // Displays Conversation
  const dispatchEmail = async () => {
    dispatch(removeNotification(newNotif));
    dispatch(getEmail(email));
    dispatch(setToggle("single"));

    dispatch(
      setReciever([
        {
          _id: socketRoom,
          users: [email[0].header.from[0].email, email[0].header.to[0].email],
        },
      ])
    );
    dispatch(
      setRecipient([
        {
          _id: socketRoom,
          users: [email[0].header.from[0].email, email[0].header.to[0].email],
        },
      ])
    );
  };

  useEffect(() => {
    const joinConvo = async () => {
      if (email[0]?.data?._id) {
        joinSocketRoom(email[0]?.data?._id);
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

        // const userRecipient = emailState.recipients.filter(
        //   (recipient) =>
        //     recipient.users.includes(emailState.user.email) &&
        //     recipient.users.includes(
        //       email[0].header.to[0].email || email[0].header.to[0]
        //     )
        // );

        if (recipients.length > 0) {
          dispatch(setReciever(recipients));
          joinSocketRoom(recipients[0]?._id);
        } else {
          // CREATE CONVERSATION
          try {
            const response = await fetch(
              `/${process.env.REACT_APP_CONVERSATION_CREATE}`,
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
              joinSocketRoom(result.response.data._id);
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

    joinConvo();
  }, []);

  useEffect(() => {
    // const mailSender = email.find(
    //   (mail) =>
    //     mail.header.from[0].email ||
    //     mail.header.from[0] !== emailState.user.email
    // );

    const singleNotif = emailState?.mailNotification?.find(
      (notif) =>
        (notif.name === email[0].header?.from?.[0].email ||
          notif.name === email[0].header?.from?.[0]) &&
        notif.type === "single"
    );

    const groupNotif = emailState?.mailNotification?.find(
      (notif) =>
        notif.name === email[0].header.subject?.[0] && notif.type === "group"
    );

    if (hasType.length > 0 && groupNotif) {
      setNewNotif(groupNotif);
    } else if (
      singleNotif
      // emailState?.mailNotification?.includes(
      //   mailSender?.header?.from?.[0].email ||
      //     mailSender?.header?.from?.[0] ||
      //     email.header?.to?.[0].email ||
      //     email[0]?.header?.to[0]
      // )
    ) {
      setNewNotif(
        singleNotif
        //   {
        //   name:
        //     mailSender?.header?.from?.[0]?.email || mailSender?.header?.from?.[0],
        //   type: "single",
        // }
      );
    } else {
      setNewNotif(null);
    }
  }, [emailState.mailNotification]);

  return (
    <div onClick={dispatchEmail} className="MessageList">
      {newNotif ? <h1 className="new__mailNotif">New Notification!</h1> : null}
      {hasType.length > 0 ? (
        <div className="message__avatarIcon">
          <HiUserGroup />
        </div>
      ) : (
        <div className="message__avatar">
          {email[0]?.header?.from[0]?.name?.[0] ||
            email[0]?.header?.from[0]?.email?.[0] ||
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
                ? email?.[0]?.header.from?.[0].email ||
                    email?.[0]?.header?.from?.[0]
                : email?.[0]?.header.to?.[0].email
                ? email?.[0]?.header.to?.[0].email || email?.[0]?.header.to?.[0]
                : hasType[0]?.header?.subject[0].replace(
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
