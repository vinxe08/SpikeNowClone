import React, { useEffect } from "react";
import "./ChatRoom.css";
import { useDispatch, useSelector } from "react-redux";
import UserSection from "./Sidebar/UserSection";
import MenuBar from "./Sidebar/MenuBar";
import EmptyPage from "./Conversation/EmptyPage";
import Conversation from "./Conversation";
import ContactList from "./ContactList";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getAllEmail, getEmail } from "../../features/email/emailSlice";
import Contact from "./Contact/Contact";
import Swal from "sweetalert2";
import { Toast } from "../../lib/sweetalert";
import {
  hideContactInfo,
  setCaller,
  setIsCalling,
} from "../../features/show/showSlice";
import Notification from "./Contact/Notification";

function ChatRoom() {
  const state = useSelector((state) => state.emailReducer);
  const toggle = useSelector((state) => state.showReducer.active);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useOutletContext();
  const caller = useSelector((state) => state.showReducer.caller);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Fetch the User's Information and all Email.
        const response = await fetch("http://localhost:3001/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(state.user),
        });
        const data = await response.json();
        if (!data.userExists && !data.error) {
          dispatch(getAllEmail(data.email));
          Swal.close();
          navigate("/");
        } else {
          Swal.close();
          Toast.fire({
            icon: "error",
            title: "Wrong credentials. Try Again",
          });
        }
      } catch (error) {
        console.log("ERROR: ", error);
        Swal.close();
        Toast.fire({
          icon: "error",
          title: "Error. Try Again Later",
        });
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    }
    dispatch(getEmail(null));
    dispatch(hideContactInfo());
    dispatch(setCaller(null));
    dispatch(setIsCalling(false));

    socket.on("previous_video_requests", (data) => {
      if (data) {
        dispatch(setCaller(data[0]));
      } else {
        dispatch(setCaller(null));
      }
    });
  }, []);

  useEffect(() => {
    socket.on("send_request", (data) => {
      dispatch(setCaller(data));
    });
  }, [socket]);

  return (
    <div className="ChatRoom">
      <div className="SideBar">
        <UserSection />
        <ContactList />
        <MenuBar />
      </div>
      {state.email?.length > 0 ? <Conversation /> : <EmptyPage />}
      {toggle ? <Contact /> : null}
      {caller && <Notification caller={caller} />}
    </div>
  );
}

export default ChatRoom;
