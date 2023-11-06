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
  setReciever,
  setRecipient,
  setToggle,
} from "../../features/email/emailSlice";
import Contact from "./Contact/Contact";
import Swal from "sweetalert2";
import { Toast } from "../../lib/sweetalert";
import {
  hideContactInfo,
  setCaller,
  setInComingCall,
  setIsCalling,
} from "../../features/show/showSlice";
import Notification from "./Contact/Notification";
import GroupList from "./Sidebar/GroupList";
import Modal from "./Modal";
import GroupConversation from "./GroupEmail/GroupConversation";
import FadeLoader from "react-spinners/FadeLoader";
import sound from "../../assets/ringtone.mp3";
import { AiOutlineCloseCircle } from "react-icons/ai";

function ChatRoom() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useOutletContext();
  const state = useSelector((state) => state.emailReducer);
  const isActive = useSelector((state) => state.showReducer.active);
  const isCalling = useSelector((state) => state.showReducer.isCalling);
  const inComingCall = useSelector((state) => state.showReducer.inComingCall);
  const caller = useSelector((state) => state.showReducer.caller);
  const menu = useSelector((state) => state.menuReducer.menu);
  const modal = useSelector((state) => state.menuReducer.modalCreate);
  const [loading, setLoading] = useState(false);
  const [ringtone] = useState(new Audio(sound));
  const [openPermission, setOpenPermission] = useState(false);
  const [callee, setCallee] = useState(null);

  const acceptPermission = () => {
    setOpenPermission(true);
  };

  const playRingtone = () => {
    if (ringtone && inComingCall) {
      ringtone.play().catch((error) => {
        // Handle the play() promise error here
        console.error("Failed to play ringtone:", error);
      });
      console.log("PLAY RINGTONE");
    }
  };

  const stopRingtone = () => {
    ringtone.pause();
    ringtone.currentTime = 0;
    console.log("PAUSE RINGTONE");
  };

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

      if (!data.userExists && !data.error) {
        dispatch(getAllEmail(data.email));
        if (data.groups.group) {
          dispatch(setGroupEmail(data.groups.group));
          data.groups.group.map((group) => {
            // FOR GROUP INCOMING MAIL || DO THIS WHEN FOR NEWLY CREATED GROUP
            socket.emit("select_conversation", group._id);
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
    dispatch(setInComingCall(false));

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
      if (isCalling) {
        socket.emit("ignore_call", data);
      } else {
        setCallee(data.caller);
        dispatch(setCaller(data));
        dispatch(pushNotification({ name: data.caller, type: data.mailType }));
        console.log("send_request: ", data, state?.email);
        if (openPermission) {
          dispatch(setInComingCall(true));
        }
      }
    });
    // }

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

      socket.emit("select_conversation", data._id);
      dispatch(
        setReciever([
          {
            groupName: data.groupName,
            users: data.users,
            _id: data._id,
          },
        ])
      );
      dispatch(
        setRecipient([
          {
            groupName: data.groupName,
            users: data.users,
            _id: data._id,
          },
        ])
      );
    });
  }, [socket]);

  useEffect(() => {
    if (openPermission && caller && state.mailNotification.length > 0) {
      dispatch(setInComingCall(true));
    }
  }, [openPermission, caller, state.mailNotification]);

  useEffect(() => {
    if (inComingCall) {
      playRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [inComingCall]);

  // TODO 1: Add ring audio when someone is calling. Stop when the user accepted.
  // TODO 2: When in voice/video call, Hold/block all the button except on the voice/video call

  // ERROR 1: useVoiceChat.js & useVideoChat.js -> line 98 ->
  // FIXED: do a test -> if it didn't work ? remove and do a test
  // ERROR 2: In emailSlice.js -> pushNotification() -> It add even it is already in the redux state ->
  // FIXED: Do a test on it.

  // TODO 3: In close button modal for when calling -> the "X" button should also close/leave the VideoCall Page

  // MESSAGE MODAL: Spike needs your permission to enable notifications

  return (
    <div className="ChatRoom">
      {!openPermission && (
        <div onClick={acceptPermission} className="notification__permission">
          <div className="permission__container">
            <h1 className="permission__h1">
              Spike needs your permission to enable notifications
            </h1>
            <button className="permission__accept" onClick={acceptPermission}>
              <AiOutlineCloseCircle />
            </button>
          </div>
        </div>
      )}
      {isCalling && <div className="caller__divider"></div>}
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
        state.email.some(
          (mail) =>
            (mail.header.from[0].email &&
              mail.header.from[0].email === callee) ||
            (mail.header.subject[0] && mail.header.subject[0] === callee)
        ) &&
        caller && <Notification caller={caller} />}
      {modal ? <Modal /> : null}
    </div>
  );
}

export default ChatRoom;
