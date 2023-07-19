import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

function RootLayout() {
  const [username, setUsername] = useState("");
  const user = useSelector((state) => state.emailReducer.user);

  return user === null ? (
    <Navigate to="/login" />
  ) : (
    <Outlet context={{ username, setUsername, socket }} />
  );
}

export default RootLayout;
