import React, { useEffect, useState } from "react";
import "./Contact.css";
import { IoClose } from "react-icons/io5";
import { BsFillTelephoneForwardFill, BsCameraVideoFill } from "react-icons/bs";
import {
  hideContactInfo,
  setIsCalling,
  setType,
} from "../../../features/show/showSlice";
import { useDispatch, useSelector } from "react-redux";
import TimeAgo from "react-timeago";
import VideoCallPage from "./VideoCallPage";
import { useOutletContext } from "react-router-dom";
import CallingNotification from "./CallingNotification";
import VoiceChatPage from "./VoiceChatPage";
import { truncate } from "../../../lib/truncate";

function Contact() {
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const state = useSelector((state) => state.emailReducer.email);
  const recipients = useSelector((state) => state.emailReducer.recipients);
  const isCalling = useSelector((state) => state.showReducer.isCalling);
  const type = useSelector((state) => state.showReducer.type);
  const user = useSelector((state) => state.emailReducer.user);
  const [recipient, setRecipient] = useState();

  console.log("EMAIL: ", state);

  const [sendCall, setSendCall] = useState(null);
  const selectedRecipient = recipients?.filter(
    (data) =>
      data.users.includes(
        state?.[0].header.from?.[0]?.email || state?.[0].header.from?.[0]
      ) &&
      data.users.includes(
        state?.[0].header.to?.[0]?.email || state?.[0].header.to?.[0]
      )
  );

  useEffect(() => {
    if (selectedRecipient.length > 0) {
      setRecipient(selectedRecipient);
    } else {
      setRecipient(recipients);
    }
  }, [recipients]);

  const closeModal = () => {
    setSendCall(null);
  };

  const callUser = (type) => {
    dispatch(setIsCalling(true));

    if (type === "Video Call") {
      console.log("Video Call: ", recipient[0]._id);
      setSendCall({
        id: recipient[0]._id, // THIS IS NOT THE SAME WITH OTHER TABS -> FIX IT IN MessageList.jsx
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Video Call",
        caller: user.email,
        mailType: state[0].header.type ? "group" : "single",
      });
      dispatch(setType("Video Call"));

      socket.emit("create_request", {
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Video Call",
        caller: user.email,
        mailType: state[0].header.type ? "group" : "single",
      });
    } else {
      console.log("Voice Call: ", recipient[0]._id);
      setSendCall({
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Voice Call",
        caller: user.email,
        mailType: state[0].header.type ? "group" : "single",
      });
      dispatch(setType("Voice Call"));

      socket.emit("create_request", {
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Voice Call",
        caller: user.email,
        mailType: state[0].header.type ? "group" : "single",
      });
    }
  };

  useEffect(() => {
    socket.on("ignore_response", (data) => {
      dispatch(setIsCalling(false));
      alert("CALL IGNORED");
    });

    socket.on("on_accept", (data) => {
      setSendCall(null);
    });
  }, [socket]);

  return (
    <div className="Contact">
      <div className="contact__container">
        <div className="contact__header">
          <div
            className="contact__close"
            onClick={() => dispatch(hideContactInfo())}
          >
            <IoClose />
          </div>
          <h1 className="contact__h1">Contact Info</h1>
        </div>
        <div className="contact__infoSection">
          <div className="contact__userInfo">
            <div className="avatar__container">
              <h1 className="contact__nameAvatar">
                {state?.[0].header.from?.[0].name?.[0]}
              </h1>
            </div>
            <div className="name__email">
              <h1 className="namee">{state?.[0].header.from[0].name}</h1>
              <h1 className="emaill">{state?.[0].header.from[0].email}</h1>
            </div>
          </div>
          <div className="contact__callSection">
            <h1 className="call__now">Call Now</h1>
            <div
              onClick={() => callUser("Video Call")}
              className="video__section"
            >
              <BsCameraVideoFill />
            </div>
            <div
              onClick={() => callUser("Voice Call")}
              className="phone__section"
            >
              <BsFillTelephoneForwardFill />
            </div>
          </div>
        </div>
        <div className="threads__section">
          {/* THREAD LIST */}
          <h1 className="threads__title">THREADS</h1>
          {/* THREADS */}
          {state?.length > 0
            ? state.map((email, index) => (
                <div key={index} className="threads__container">
                  <h1 className="threads__avatar">
                    {email.header.from?.[0].name?.[0]}
                  </h1>
                  <div className="threads__info">
                    <div className="threads__user">
                      <h1 className="threads__name">
                        {email.header.from?.[0].name}
                      </h1>
                      <h1 className="threads__timestamp">
                        <TimeAgo date={email.header.date?.[0]} />
                      </h1>
                    </div>
                    <h1 className="threads__subject">
                      {email.header.subject?.[0] || ""}
                    </h1>
                    <h1 className="threads__message">
                      {truncate(email.body, 30)}
                    </h1>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>

      {isCalling && type === "Video Call" ? (
        // Video Call Page
        <VideoCallPage />
      ) : isCalling && type === "Voice Call" ? (
        // Voice Call Page
        <VoiceChatPage />
      ) : null}
      {sendCall ? (
        <CallingNotification caller={sendCall} modal={closeModal} />
      ) : null}
    </div>
  );
}

export default Contact;
