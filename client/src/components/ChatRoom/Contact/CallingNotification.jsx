import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import "./Notification.css";
import { setCaller, setIsCalling } from "../../../features/show/showSlice";
import { useOutletContext } from "react-router-dom";

// CALLERS NOTIFICATION
function CallingNotification({ caller, modal }) {
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const user = useSelector((state) => state.emailReducer.user);

  const ignoreCall = () => {
    dispatch(setCaller(null));
    dispatch(setIsCalling(false));
    socket.emit("ignore_call", {
      ...caller,
      ignorer: user.email,
      ignoreLocation: "CallingNotification.jsx",
    });
    modal();
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
        </div>
      </div>
    </div>
  );
}

export default CallingNotification;
