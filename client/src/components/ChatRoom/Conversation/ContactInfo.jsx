import React from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { BsArchive, BsThreeDotsVertical, BsCameraVideo } from "react-icons/bs";
import "./ContactInfo.css";
import { useSelector, useDispatch } from "react-redux";
import { showContactInfo } from "../../../features/show/showSlice";

function ContactInfo() {
  const state = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const hasType = state.email.filter((item) => item.header.type);

  return (
    <div className="ContactInfo">
      <div className="arrow__back">
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
              state.email?.[0]?.header?.subject[0]}
        </h1>
        <div className="contact__select">
          <h1 className="contact__text">Contact Info</h1>
          <IoIosArrowForward />
        </div>
      </div>
      <div className="contact__icon">
        <IoSearchOutline />
        <BsCameraVideo />
        <BsArchive />
        <BsThreeDotsVertical />
      </div>
    </div>
  );
}

export default ContactInfo;
