import React from "react";
import { ImMenu } from "react-icons/im";
import { IoIosArrowForward } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { VscFilter } from "react-icons/vsc";
import { useSelector } from "react-redux";
import "./UserSection.css";

function UserSection() {
  const user = useSelector((state) => state.emailReducer.user);
  return (
    <div className="UserSection">
      <div className="user__avatar">
        {user.email[0]}
        <div className="hamburger__icon">
          <ImMenu />
        </div>
      </div>
      <div className="priority__section">
        <div className="priority__text">
          <h1 className="priority">Priority</h1>
          <h1 className="priority__icon">
            <IoIosArrowForward />
          </h1>
        </div>
        <h1 className="user__email">{user.email}</h1>
      </div>
      <div className="right__icon">
        <VscFilter />
      </div>
      <div className="right__icon margin">
        <IoSearchOutline />
      </div>
    </div>
  );
}

export default UserSection;
