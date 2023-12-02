import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { BsSendCheckFill } from "react-icons/bs";
import "./Notification.css";
import {
  setCaller,
  setInComingCall,
  setIsCalling,
  setOnCall,
  setType,
  showContactInfo,
} from "../../../features/show/showSlice";
import { useOutletContext } from "react-router-dom";
import {
  pushRejectCall,
  removeAllCallNotification,
} from "../../../features/email/emailSlice";

// RECEIVER's NOTIFICATION
function Notification({ caller, sender }) {
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const user = useSelector((state) => state.emailReducer.user);

  const ignoreCall = () => {
    if (caller.mailType === "group") {
      dispatch(setCaller(null));
      dispatch(pushRejectCall(caller));
    } else {
      dispatch(setCaller(null));
      dispatch(setInComingCall(false));
      dispatch(setIsCalling(false));
      socket.emit("ignore_call", {
        ...caller,
        ignorer: user.email,
        ignoreLocation: "Notification.jsx",
      });
    }
  };

  const acceptCall = () => {
    dispatch(showContactInfo());
    dispatch(setCaller(null));
    dispatch(setIsCalling(true));
    dispatch(setType(caller.type));
    dispatch(setInComingCall(false));
    dispatch(removeAllCallNotification());
    dispatch(setOnCall(true));
    socket.emit("on_accept", { ...caller, ignorer: user.email });
  };

  useEffect(() => {
    const ignoreResponse = (data) => {
      // if (caller.mailType === "group") {
      //   dispatch(setCaller(null));
      //   dispatch(pushRejectCall(caller));
      // } else {
      dispatch(setCaller(null));
      dispatch(setInComingCall(false));
      dispatch(setIsCalling(false));
      alert("CALL CANCELED");
      // socket.emit("ignore_call", {
      //   ...caller,
      //   ignorer: user.email,
      //   ignoreLocation: "Notification.jsx",
      // });
      // }
    };
    socket.on("ignore_response", ignoreResponse);

    return () => {
      socket.off("ignore_response", ignoreResponse);
    };
  }, [socket]);

  return (
    <div className="incoming__call">
      <div className="incoming__container">
        <h1 className="callers__avatar">{caller?.name?.[0]}</h1>
        <h1 className="callers__name">{caller?.name}</h1>
        <h1 className="call__type">{caller?.type}...</h1>
        <div className="callers__button">
          <button onClick={ignoreCall} className="callers__ignore">
            <IoClose />
          </button>
          {!sender && (
            <button onClick={acceptCall} className="callers__accept">
              <BsSendCheckFill />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notification;
