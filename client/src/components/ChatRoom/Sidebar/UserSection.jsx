import React, { useState } from "react";
import { ImMenu } from "react-icons/im";
import { IoIosArrowForward } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { VscFilter } from "react-icons/vsc";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { persistor } from "../../../app/store";
import "./UserSection.css";
import { infoList, lowerList } from "./UserSectionData";

function UserSection() {
  const user = useSelector((state) => state.emailReducer.user);
  const [userInfoModal, setUserInfoModal] = useState(false);
  const navigate = useNavigate();

  const toggleUserInfo = () => {
    setUserInfoModal((prev) => !prev);
  };

  // Logout: Clean all user's trace
  const logout = () => {
    persistor.pause();
    persistor.flush().then(() => {
      return persistor.purge();
    });
    navigate("/login");
  };
  return (
    <div className="UserSection">
      <div onClick={toggleUserInfo} className="user__avatar">
        {user.email[0]}
        <div className="hamburger__icon">
          <ImMenu />
        </div>

        {/* Modal for user info */}
        {userInfoModal ? (
          <div className="userinfo__modal">
            <div className="userinfo__row">
              <div className="userinfo__avatar">{user.email[0]}</div>
              <div className="userinfo__column">
                <h1 className="userinfo__name">
                  {user.email.slice(0, user.email.indexOf("@"))}
                </h1>
                <h1 className="userinfo__email">{user.email}</h1>
              </div>
            </div>
            {infoList.map((info, index) => (
              <div key={index} className="userinfo__row2">
                <div className="userinfo__icon2">{info.icon}</div>
                <h1 className="userinfo__iconname2">{info.name}</h1>
              </div>
            ))}
            {lowerList.map((info, index) => (
              <div
                onClick={info.name === "Logout" ? logout : null}
                key={index}
                className={
                  info.name === "Add Account"
                    ? "userinfo__row3 userinfo__row3border"
                    : "userinfo__row3"
                }
              >
                <div className="userinfo__icon2">{info.icon}</div>
                <h1 className="userinfo__iconname2">{info.name}</h1>
              </div>
            ))}
          </div>
        ) : null}
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
