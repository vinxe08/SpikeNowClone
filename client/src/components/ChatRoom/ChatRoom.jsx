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
  pushGroupEmail,
  pushNotification,
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
  const isCalling = useSelector((state) => state.showReducer.isCalling);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useOutletContext();
  const caller = useSelector((state) => state.showReducer.caller);
  const menu = useSelector((state) => state.menuReducer.menu);
  const modal = useSelector((state) => state.menuReducer.modalCreate);
  const [loading, setLoading] = useState(false);
  // console.log("CALLER: ", caller);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      // Fetch the User's Information and all Email.
      const response = await fetch(`/${process.env.REACT_APP_API_USERS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.user),
      });
      const data = await response.json();
      // console.log("CHATROOM: RES - ", response);

      if (!data.userExists && !data.error) {
        dispatch(getAllEmail(data.email));
        if (data.groups.group) {
          dispatch(setGroupEmail(data.groups.group));
          data.groups.group.map((group) => {
            // FOR GROUP INCOMING MAIL || DO THIS WHEN FOR NEWLY CREATED GROUP
            return socket.emit(
              "group logged in",
              `${group.groupName}: ${group._id} - ${state.user.email}`
            );
          });
        }
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
  }, []);

  useEffect(() => {
    if (!state.user) {
      navigate("/login");
    }
    dispatch(getEmail([]));
    dispatch(hideContactInfo());
    dispatch(setCaller(null));
    dispatch(setIsCalling(false));
    dispatch(setToggle(null));
    dispatch(getEmail([]));

    socket.on("previous_video_requests", (data) => {
      if (data) {
        dispatch(setCaller(data[0]));
      } else {
        dispatch(setCaller(null));
      }
    });

    // FOR SINGLE INCOMING MAIL
    socket.emit("logged in", state.user.email);
  }, []);

  useEffect(() => {
    socket.on("send_request", (data) => {
      console.log("SEND REQUEST: ", data);
      if (isCalling) {
        socket.emit("ignore_call", data);
      } else {
        dispatch(setCaller(data));
        if (
          state.email.length > 0 &&
          state.email.some((mail) => mail.header.from[0].email)
        ) {
          dispatch(
            pushNotification({ name: data.caller, type: data.mailType })
          );
        }
      }
    });

    socket.on("new group", (data) => {
      // Notification for joining a new group
      Toast.fire({
        icon: "success",
        title: "New group",
      });

      dispatch(pushGroupEmail(data));

      // Joins a room for new group
      socket.emit(
        "group logged in",
        `${data.groupName}: ${data._id} - ${state.user.email}`
      );
    });
  }, [socket]);

  console.log("NOTIF: ", state.mailNotification);

  // ISSUE: 153 in useVoiceChat.js -> Error: Connection failed. | at n.value (index.js:699:28) | at o._pc.onconnectionstatechange (index.js:118:12) -> ISSUE: No AUDIO
  // TRY: Decrease the time in setTimeout or create a socket that will check if the other user get your signal before doing the peer.signal in setTimeout
  // ISSUE:  154 in useVideoChat.js -> "Error: Connection failed. | at n.value (index.js:699:28) | at o._pc.onconnectionstatechange (index.js:118:12)"
  // TRY: Decrease the time in setTimeout or create a socket that will check if the other user get your signal before doing the peer.signal in setTimeout
  //  TypeError: t.peer.destoy is not a function
  //     at n.<anonymous> (useVoiceChat.js:96:26)
  //     at Et.emit (index.mjs:136:20)
  //     at n.value (socket.js:498:20)
  //     at n.value (socket.js:485:18)
  //     at n.value (socket.js:455:22)
  //     at Et.emit (index.mjs:136:20)
  //     at manager.js:207:18

  // --------------- ADD FEATURE ----------------
  // NEW MAIL ARRIVE: When new mail arrive, add some notification(maybe on contact/message list) like the number of new mail.

  // NEW GROUP IS CREATED: Add a notification(top right) for success creating/joining new group.

  // Group List - new email didnt shown

  // TODO: When the user is in call, all users cant do a call on this. -> In socket.on("send_request"), isCalling ? send a response (decline) : DO "dispatch(setCaller(data)) && dispatch(pushNotification(data.caller))"
  // ALGO: isCalling -> if acceptCall() -> setIsCalling(true)

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
      {!isCalling &&
        state.email.length > 0 &&
        state.email.some((mail) => mail.header.from[0].email) &&
        caller && <Notification caller={caller} />}
      {modal ? <Modal /> : null}
    </div>
  );
}

export default ChatRoom;
