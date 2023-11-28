import React, { useEffect, useState } from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { BsArchive, BsThreeDotsVertical, BsCameraVideo } from "react-icons/bs";
import "./ContactInfo.css";
import { useSelector, useDispatch } from "react-redux";
import {
  hideContactInfo,
  setCall,
  setIsCalling,
  setType,
  showContactInfo,
} from "../../../features/show/showSlice";
import { useOutletContext } from "react-router-dom";
import { getEmail, setToggle } from "../../../features/email/emailSlice";

function ContactInfo() {
  const state = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const hasType = state.email.filter((item) => item.header.type);
  const [recipient, setRecipient] = useState();
  const { socket } = useOutletContext();
  const recipients = useSelector((state) => state.emailReducer.recipients);

  const selectedRecipient = recipients?.filter(
    (data) =>
      data.users.includes(
        state.email?.[0]?.header?.from?.[0]?.email ||
          state.email?.[0]?.header?.from?.[0]
      ) &&
      data.users.includes(
        state.email?.[0]?.header.to?.[0]?.email ||
          state.email?.[0]?.header?.to?.[0]
      )
  );

  const callUser = () => {
    dispatch(showContactInfo());
    dispatch(setIsCalling(true));
    dispatch(
      setCall({
        id: recipient[0]._id,
        name: state.email?.[0].header.to[0]?.name,
        email: state.user.email,
        type: "Video Call",
        caller: state.email?.[0].header.type
          ? state.email?.[0].header.subject[0]
          : state.user.email,
        mailType: state.email?.[0].header.type ? "group" : "single",
      })
    );
    dispatch(setType("Video Call"));

    socket.emit("create_request", {
      id: recipient[0]._id,
      name: state.email?.[0].header.to[0]?.name,
      email: state.user.email,
      type: "Video Call",
      caller: state.email?.[0].header.type
        ? state.email?.[0].header.subject[0]
        : state.user.email,
      mailType: state.email?.[0].header.type ? "group" : "single",
    });
  };

  useEffect(() => {
    if (selectedRecipient.length > 0) {
      setRecipient(selectedRecipient);
    } else {
      setRecipient(recipients);
    }
  }, [recipients]);

  return (
    <div className="ContactInfo">
      <div
        onClick={() => {
          dispatch(hideContactInfo());
          dispatch(getEmail([]));
          // dispatch(setToggle(null));
        }}
        className="arrow__back"
      >
        <IoIosArrowBack />
      </div>
      <div
        onClick={() => dispatch(showContactInfo())}
        className="contact__info"
      >
        <h1 className="contact__name">
          {hasType.length > 0
            ? hasType[0].header.subject[0].replace(
                `: ${hasType[0].data._id}`,
                ""
              )
            : state.email?.[0]?.header?.from?.[0]?.name ||
              state.email?.[0]?.header?.from?.[0]?.email ||
              state.email?.[0]?.header?.subject?.[0] ||
              "User"}
        </h1>
        <div className="contact__select">
          <h1 className="contact__text">Contact Info</h1>
          <IoIosArrowForward />
        </div>
      </div>
      <div className="contact__icon">
        <IoSearchOutline />
        <div onClick={callUser} className="camera__icon">
          <BsCameraVideo />
        </div>
        <BsArchive />
        <BsThreeDotsVertical />
      </div>
    </div>
  );
}

export default ContactInfo;
