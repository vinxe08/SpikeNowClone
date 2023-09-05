import React, { useEffect, useState } from "react";
import "./ChatRoom.css";
import { useDispatch, useSelector } from "react-redux";
import UserSection from "./Sidebar/UserSection";
import MenuBar from "./Sidebar/MenuBar";
import EmptyPage from "./Conversation/EmptyPage";
import Conversation from "./Conversation";
import ContactList from "./ContactList";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  getAllEmail,
  getEmail,
  setGroupEmail,
  setToggle,
} from "../../features/email/emailSlice";
import Contact from "./Contact/Contact";
import Swal from "sweetalert2";
import { Toast } from "../../lib/sweetalert";
import {
  hideContactInfo,
  setCaller,
  setIsCalling,
} from "../../features/show/showSlice";
import Notification from "./Contact/Notification";
import GroupList from "./Sidebar/GroupList";
import Modal from "./Modal";
import GroupConversation from "./GroupEmail/GroupConversation";
import FadeLoader from "react-spinners/FadeLoader";

function ChatRoom() {
  const state = useSelector((state) => state.emailReducer);
  const isActive = useSelector((state) => state.showReducer.active);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useOutletContext();
  const caller = useSelector((state) => state.showReducer.caller);
  const menu = useSelector((state) => state.menuReducer.menu);
  const modal = useSelector((state) => state.menuReducer.modalCreate);
  const [loading, setLoading] = useState(false);
  // console.log("CHAT ROOM");
  const fetchUserInfo = async () => {
    setLoading(true);
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
      // console.log("DATA: ", data);

      if (!data.userExists && !data.error) {
        dispatch(getAllEmail(data.email));
        dispatch(setGroupEmail(data.groups.group));
        Swal.close();
        navigate("/");
        setLoading(false);
      } else {
        Swal.close();
        Toast.fire({
          icon: "error",
          title: "Wrong credentials. Try Again",
        });
        setLoading(false);
      }
    } catch (error) {
      console.log("ERROR: ", error);
      Swal.close();
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [modal]);

  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    }
    dispatch(getEmail(null));
    dispatch(hideContactInfo());
    dispatch(setCaller(null));
    dispatch(setIsCalling(false));
    dispatch(setToggle(null));

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

  // TODO 1: In Contact Info -> the emails/messages must only contains the recipient's emails/messages
  // TODO 2: The Contact Info close button(Not in video/voice call page).

  return (
    <div className="ChatRoom">
      {/* SIDE BAR */}

      <div className="SideBar">
        <UserSection />
        {loading ? (
          <div className="main__loading">
            <div className="loading__list">
              <FadeLoader
                color="#1E90FF"
                loading={true}
                size={100}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          </div>
        ) : (
          <>{menu === "Home" ? <ContactList /> : <GroupList />}</>
        )}
        <MenuBar />
      </div>

      {/* MESSAGE/CONVERSATION CONTENT */}
      {state.toggle === "single" ? (
        <Conversation />
      ) : state.toggle === "group" ? (
        <GroupConversation />
      ) : (
        <EmptyPage />
      )}

      {/* FOR VIDEO/VOICE CALL */}
      {isActive ? <Contact /> : null}
      {caller && <Notification caller={caller} />}
      {modal ? <Modal /> : null}
      {/* 
        NEXT: CREATE A PAGE FOR GROUP MESSAGE | Use NodeMailer for sending & Use DB for storing to display. 
        1 -> Create the UI for the Group Message 
        2 -> Create a page like for messaging(2 users)
        3 -> Message will send via NodeMailer & save in DB
        4 -> Display in UI with Realtime-alike
        5 -> Display the group in ChatRoom->ContactList and also in GroupList

        TODO: Get the SENT inbox using IMAP. e.g "imap.openBox("INBOX",...)"
      */}
    </div>
  );
}

export default ChatRoom;