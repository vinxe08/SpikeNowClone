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

function Contact() {
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const state = useSelector((state) => state.emailReducer.email);
  const recipients = useSelector((state) => state.emailReducer.recipients);
  const emailReducer = useSelector((state) => state.emailReducer);
  const isCalling = useSelector((state) => state.showReducer.isCalling);
  const type = useSelector((state) => state.showReducer.type);
  console.log("emailReducer: ", emailReducer);
  const [recipient, setRecipient] = useState();

  const [sendCall, setSendCall] = useState(null);
  // Room ID - Try to add another logic in order to get the email from type:"GROUP"
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

  // console.log("STATE: ", state);
  // console.log("ALL recipient", recipients);
  console.log("ONE recipient: ", recipient); // NO RECIPIENTS FOR GROUP

  // For shorten and add ellipsis at the last part of the paragraph
  const truncate = (paragraph, maxLength) => {
    if (paragraph?.length <= maxLength) {
      return paragraph;
    }
    return paragraph?.slice(0, maxLength) + "...";
  };

  const closeModal = () => {
    setSendCall(null);
  };

  const callUser = (type) => {
    dispatch(setIsCalling(true));

    console.log("CONTACT: ", recipient);
    if (type === "Video Call") {
      setSendCall({
        id: recipient[0]._id, // ERROR: No ._id
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Video Call",
      });
      dispatch(setType("Video Call"));

      socket.emit("create_request", {
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Video Call",
      });
    } else {
      setSendCall({
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Voice Call",
      });
      dispatch(setType("Voice Call"));

      socket.emit("create_request", {
        id: recipient[0]._id,
        name: state[0].header.to[0]?.name,
        email: state[0].header.to[0]?.email,
        type: "Voice Call",
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

      {/* Video Call Page */}
      {isCalling && type === "Video Call" ? (
        <VideoCallPage />
      ) : isCalling && type === "Voice Call" ? (
        <VoiceChatPage />
      ) : null}
      {sendCall ? (
        <CallingNotification caller={sendCall} modal={closeModal} />
      ) : null}

      {/* Voice Chat Page */}
    </div>
  );
}

export default Contact;
