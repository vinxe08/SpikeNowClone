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
  const spreadEmail = [...email];

  const sortedArray = spreadEmail.sort((a, b) => {
    const dateA = new Date(a.header.date[0]);
    const dateB = new Date(b.header.date[0]);
    return dateA - dateB;
  });

  useEffect(() => {
    setEmail(state.email);
  }, [state.email]);

  return (
    <ScrollToBottom className="scroll-to-bottom ">
      <div className="MessageContent">
        {sortedArray &&
          sortedArray
            .filter((mail) => mail.body)
            .map((message, index) => (
              <div
                key={index}
                className={
                  state.user.email === message.header.from[0].email ||
                  message.header.from[0] === state.user.email
                    ? "content__section is__user"
                    : "content__section"
                }
              >
                <h1 className="content__timestamp">
                  <TimeAgo date={message?.header?.date?.[0]} />
                </h1>
                <div className="content__div">
                  <div
                    className={
                      state.user.email === message.header.from?.[0].email ||
                      message.header.from[0] === state.user.email
                        ? "content__avatar content__user"
                        : "content__avatar"
                    }
                  >
                    {message.header.from?.[0].email?.[0] ||
                      message.header.from[0][0]}
                  </div>
                  <div className="content__body">
                    <h1 className="content__subject">
                      {message?.header?.subject?.[0]}
                    </h1>
                    <pre
                      className="content__message"
                      dangerouslySetInnerHTML={{ __html: message?.body }}
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
