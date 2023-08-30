import React from "react";
import { useDispatch } from "react-redux";
import { IoClose } from "react-icons/io5";
import { BsSendCheckFill } from "react-icons/bs";
import "./Notification.css";
import {
  setCaller,
  setIsCalling,
  setType,
  showContactInfo,
} from "../../../features/show/showSlice";
import { useOutletContext } from "react-router-dom";

// RECEIVER's NOTIFICATION
function Notification({ caller, sender }) {
  // console.log("RECEIVER: ", caller, sender);

  const dispatch = useDispatch();
  const { socket } = useOutletContext();

  const ignoreCall = () => {
    dispatch(setCaller(null));
    socket.emit("ignore_call", caller);
  };

  // HERE IS THE LAST TRACK: modify the on_accept socket and make it available also for call
  const acceptCall = () => {
    dispatch(showContactInfo());
    dispatch(setCaller(null));
    dispatch(setIsCalling(true));
    dispatch(setType(caller.type));
    socket.emit("on_accept", caller);
  };

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
