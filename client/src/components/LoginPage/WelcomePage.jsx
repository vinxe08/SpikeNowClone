import React, { useState } from "react";
import { MdWavingHand } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../features/email/emailSlice";
import { isUserExist } from "../../features/login/loginSlice";
import { Toast } from "../../lib/sweetalert";
import Swal from "sweetalert2";
import { SlArrowLeft } from "react-icons/sl";
import { RiQuestionnaireLine } from "react-icons/ri";
import "./WelcomePage.css";

export default function WelcomePage() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    imap_server: "",
    imap_port: null,
  });
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [userExist, setUserExist] = useState(false);
  const dispatch = useDispatch();

  // MICROSOFT LOGIN: Didn't add this feature
  const logInWithMicrosoft = async () => {
    Toast.fire({
      icon: "error",
      title: "This Feature is not Available.",
    });
  };

  // AUTHENTICATION: Check the user if it is already registered.
  const checkUser = async () => {
    Swal.fire({
      title: "Loading...",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await fetch(`/${process.env.REACT_APP_API_GETUSERS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userInfo.email }),
      });

      const result = await response.json();

      if (result?.data?.userExist && !result?.data?.error) {
        setUserInfo(result.data.user[0]);
        setUserExist(true);
      } else if (!result?.data?.userExist && !result?.data?.error) {
        dispatch(isUserExist(false));
      } else {
        Toast.fire({
          icon: "error",
          title: "Error! Try again.",
        });
      }
      Swal.close();
    } catch (error) {
      console.log("CATCH: ", error);
      Swal.close();
      Toast.fire({
        icon: "error",
        title: "Error! Try again.",
      });
    }
  };

  // Do authentication
  const submit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    if (password === userInfo.password) {
      dispatch(setUser(userInfo));
      Swal.close();
      navigate("/");
    } else {
      Toast.fire({
        icon: "error",
        title: "Wrong credentials. Try Again",
      });
    }
  };

  return (
    <>
      <div className="home__container">
        {!userExist ? (
          <>
            <h1 className="home__welcome">
              Welcome to Spike <MdWavingHand />{" "}
            </h1>
            <h3 className="home__text">
              Connect your existing email or Spike teamspace account
            </h3>
            <input
              type="email"
              placeholder="Ex: a@b.com or a@b.spike.team"
              className="home__email"
              name="email"
              value={userInfo?.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
              }
            />
            <button
              disabled={userInfo?.email === ""}
              onClick={checkUser}
              className="continue__button"
            >
              Continue
            </button>
            <button onClick={logInWithMicrosoft} className="microsoft__button">
              <img
                className="microsoft__icon"
                src="./microsoftIcon.png"
                alt=""
              />
            </button>
          </>
        ) : (
          <div className="welcome__main">
            <div className="welcome__header">
              <div
                onClick={() => setUserExist(false)}
                className="welcome__close"
              >
                <SlArrowLeft />
              </div>
              <h1 className="welcome__notimap">Not IMAP</h1>
              <RiQuestionnaireLine />
            </div>
            <img className="welcome__icon" src="spike.webp" alt="" />
            <form onSubmit={submit} className="welcome__form">
              <input
                type="text"
                name="email"
                className="welcome__email"
                placeholder="Email Address"
                value={userInfo?.email}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
                }
              />
              <input
                type="password"
                className="welcome__password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="welcome__submit">
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
