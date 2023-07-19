import React from "react";
import io from "socket.io-client";
import Chat from "./components/Chat";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import "./App.css";
import LoginRoute from "./components/LoginRoute";

const socket = io.connect("http://localhost:3001");

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ChatRoom />} exact />
        <Route path="/room/:id" element={<Chat />} exact />
      </Route>
      <Route path="login" element={<LoginRoute />} exact />
    </Routes>
  );
}

export default App;
