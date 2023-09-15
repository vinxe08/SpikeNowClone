import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import "./App.css";
import LoginRoute from "./components/LoginRoute";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ChatRoom />} exact />
      </Route>
      <Route path="login" element={<LoginRoute />} exact />
    </Routes>
  );
}

export default App;
