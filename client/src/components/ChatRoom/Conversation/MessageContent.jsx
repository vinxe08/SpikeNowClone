import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./MessageContent.css";
import TimeAgo from "react-timeago";
import { useOutletContext } from "react-router-dom";
import { addEmail } from "../../../features/email/emailSlice";
import ScrollToBottom from "react-scroll-to-bottom";

function MessageContent() {
  const state = useSelector((state) => state.emailReducer);
  const [email, setEmail] = useState([]);
  const { socket } = useOutletContext();
  const dispatch = useDispatch();

  useEffect(() => {
    // For realtime data for recipient
    socket.on("receive_email", (data) => {
      console.log("receive_email: ", data);
      dispatch(addEmail(data));
    });
  }, [socket]);

  useEffect(() => {
    setEmail(state.email);
  }, [state.email]);

  // useEffect(() => {
  //   setEmail(null);
  // }, []);

  // console.log("EMAIL: ", state.email);

  return (
    <ScrollToBottom className="scroll-to-bottom ">
      <div className="MessageContent">
        {email?.map((message, index) => (
          <div
            key={index}
            className={
              state.user === message.user
                ? "content__section is__user"
                : "content__section"
            }
          >
            <h1 className="content__timestamp">
              <TimeAgo date={message.header.date[0]} />
            </h1>
            <div className="content__div">
              <div
                className={
                  state.user === message.user
                    ? "content__avatar content__user"
                    : "content__avatar"
                }
              >
                {/* {message.user[0]} */}
              </div>
              <div className="content__body">
                <h1 className="content__subject">
                  {message.header.subject[0]}
                </h1>
                {/* <pre className="content__message">{message.body}</pre> */}
                <pre
                  className="content__message"
                  dangerouslySetInnerHTML={{ __html: message.body }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollToBottom>
  );
}

export default MessageContent;
