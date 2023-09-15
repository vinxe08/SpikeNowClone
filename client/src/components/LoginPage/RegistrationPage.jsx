import React, { useEffect, useState } from "react";
import { TfiEmail } from "react-icons/tfi";
import { SlArrowLeft, SlArrowDown } from "react-icons/sl";
import { RiQuestionnaireLine } from "react-icons/ri";
import "./RegistrationPage.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../lib/sweetalert";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/email/emailSlice";
import { isUserExist } from "../../features/login/loginSlice";

function RegistrationPage() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    imap_server: "",
    imap_port: "",
    imap_username: "",
    smtp_server: "",
    smtp_port: "",
    smtp_username: "",
  });

  const disableButton = userInfo.email === "" || userInfo.password === "";

  const inputOnChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  // FOR REGISTRATION PAGE: Create an API that checks if the user is in DB
  const submit = async (e) => {
    e.preventDefault();
    if (userInfo.smtp_username === "") {
      setShowSettings(true);
    } else {
      try {
        Swal.fire({
          title: "Loading...",
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Check if the user's info is valid
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_API_USERS}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo),
          }
        );

        const data = await response.json();

        // SUCCED: redirect to Dashboard and fetch also the user details
        if (!data.userExists && !data.error) {
          dispatch(setUser(userInfo));
          Swal.close();
          navigate("/");
        } else {
          // ANIMATION
          Swal.close();
          Toast.fire({
            icon: "error",
            title: "Wrong credentials. Try Again",
          });
        }
      } catch (error) {
        Swal.close();
        Toast.fire({
          icon: "error",
          title: "Something is Error. Try Again",
        });
      }
    }
  };

  return (
    <div className="RegistrationPage">
      <div className="registration__header">
        <div
          onClick={() => dispatch(isUserExist(true))}
          className="registration__close"
        >
          <SlArrowLeft />
        </div>
        <h1 className="registration__notimap">Not IMAP</h1>
        <RiQuestionnaireLine />
      </div>

      <div className="registration__imap">
        <TfiEmail />
        <h1 className="registration__imapText">IMAP</h1>
      </div>

      <form onSubmit={submit} className="registration__form">
        <input
          onChange={inputOnChange}
          value={userInfo.email}
          name="email"
          className="registration__field"
          type="email"
          placeholder="Email Address"
        />
        <input
          onChange={inputOnChange}
          value={userInfo.password}
          name="password"
          className="registration__field"
          type="password"
          placeholder="Password"
        />
        <div
          onClick={() => setShowSettings((prev) => !prev)}
          className="registration__show"
        >
          <h1 className="advance__setting">Advance Settings</h1>
          <div className="drop__down">
            <SlArrowDown />
          </div>
        </div>
        {showSettings ? (
          <>
            <input
              onChange={inputOnChange}
              value={userInfo.imap_server}
              name="imap_server"
              className="registration__field"
              type="text"
              placeholder="IMAP Server"
            />
            <input
              onChange={inputOnChange}
              value={userInfo.imap_port}
              name="imap_port"
              className="registration__field"
              type="number"
              placeholder="IMAP Port (Optional)"
            />
            <input
              onChange={inputOnChange}
              value={userInfo.imap_username}
              name="imap_username"
              className="registration__field"
              type="text"
              placeholder="IMAP Username (Optional)"
            />
            <input
              onChange={inputOnChange}
              value={userInfo.smtp_server}
              name="smtp_server"
              className="registration__field"
              type="text"
              placeholder="SMTP Server"
            />
            <input
              onChange={inputOnChange}
              value={userInfo.smtp_port}
              name="smtp_port"
              className="registration__field"
              type="number"
              placeholder="SMTP Port (Optional)"
            />
            <input
              onChange={inputOnChange}
              value={userInfo.smtp_username}
              name="smtp_username"
              className="registration__field"
              type="text"
              placeholder="SMTP Username (Optional)"
            />
          </>
        ) : null}
        <button
          disabled={disableButton}
          className="registration__submit"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default RegistrationPage;
