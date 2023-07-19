import React from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { BsArchive, BsThreeDotsVertical, BsCameraVideo } from "react-icons/bs";
import "./ContactInfo.css";
import { useSelector, useDispatch } from "react-redux";
import { showContactInfo } from "../../../features/show/showSlice";

function ContactInfo() {
  const state = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  // useEffect(() => {
  //   if (user === email[0]?.toRecipients[0]?.emailAddress?.address) {
  //     setRecipient({
  //       name: email[0]?.from?.emailAddress?.name,
  //       email: email[0]?.from?.emailAddress?.address,
  //     });
  //   } else {
  //     setRecipient({
  //       name: email[0]?.toRecipients[0]?.emailAddress.name,
  //       email: email[0]?.toRecipients[0]?.emailAddress.address,
  //     });
  //   }
  // }, [email]);

  return (
    <div className="ContactInfo">
      <div className="arrow__back">
        <IoIosArrowBack />
      </div>
      <div
        onClick={() => dispatch(showContactInfo())}
        className="contact__info"
      >
        <h1 className="contact__name">{state.email[0].header.from[0].name}</h1>
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
