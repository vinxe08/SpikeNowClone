import React from "react";
import "./LoginRoute.css";
import WelcomePage from "./LoginPage/WelcomePage";
import { useSelector } from "react-redux";
import RegistrationPage from "./LoginPage/RegistrationPage";

function LoginRoute() {
  const userExist = useSelector((state) => state.loginReducer.userExist);

  return (
    <div className="Home">
      <img className="spike__icon" src="spike.webp" alt="" />
      {userExist ? <WelcomePage /> : <RegistrationPage />}
    </div>
  );
}

export default LoginRoute;
