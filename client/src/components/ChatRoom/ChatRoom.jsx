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
  removeRejectCall,
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
  setCall,
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
  const callerRequest = useSelector((state) => state.showReducer.caller);
  const menu = useSelector((state) => state.menuReducer.menu);
  const modal = useSelector((state) => state.menuReducer.modalCreate);
  const [loading, setLoading] = useState(false);
  const [ringtone] = useState(new Audio(sound));
  const [openPermission, setOpenPermission] = useState(false);
  const [callee, setCallee] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);

  const call = useSelector((state) => state.showReducer.call);

  const checkNotificationReceiver = () => {
    if (callee?.mailType === "group" && callerInfo) {
      if (
        state.email?.some(
          (mail) =>
            mail.header.subject?.[0] &&
            mail.header.subject?.[0] === callerInfo?.caller
        )
      ) {
        return true;
      } else {
        return false;
      }
    } else if (callee?.mailType === "single" && callerInfo) {
      if (
        state.email.some(
          (mail) =>
            mail.header.from[0].email &&
            mail.header.from[0].email === callerInfo?.caller
        ) &&
        state.email[0].header.to.length === 1
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const acceptPermission = () => {
    setOpenPermission(true);
  };

  const playRingtone = () => {
    if (ringtone && inComingCall) {
      ringtone.play().catch((error) => {
        // Handle the play() promise error here
        console.error("Failed to play ringtone:", error);
      });
    }
  };

  const stopRingtone = () => {
    ringtone.pause();
    ringtone.currentTime = 0;
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
    dispatch(setInComingCall(false));
    dispatch(setCall(null));

    socket.on("previous_video_requests", (prevData) => {
      if (prevData && !isCalling) {
        prevData.map((data) => {
          if (
            Array.isArray(state.rejectCalls) &&
            state.rejectCalls.length > 0 &&
            !state.rejectCalls.find((rejectCalls) => rejectCalls.id === data.id)
          ) {
            dispatch(
              pushNotification({
                name: data.caller,
                type: data.mailType,
                description: data.type,
                request: data,
              })
            );
          } else {
            dispatch(removeRejectCall(data));
          }
        });
      } else {
        dispatch(setCaller(null));
      }
    });

    // FOR SINGLE INCOMING MAIL
    socket.emit("logged in", state.user.email);
  }, []);

  useEffect(() => {
    const receiveRequest = (data) => {
      if (isCalling) {
        socket.emit("ignore_call", {
          ...data,
          ignorer: state.user.email,
          ignoreLocation: "SEND REQUEST",
        });
        dispatch(setCaller(null));
      } else {
        // setCallee({ name: data.caller, mailType: data.mailType });
        if (!callerRequest) {
          dispatch(setCaller(data));
        }

        dispatch(
          pushNotification({
            name: data.caller,
            type: data.mailType,
            description: data.type,
            request: data,
          })
        );

        if (openPermission) {
          dispatch(setInComingCall(true));
        }
      }
    };
    socket.on("send_request", receiveRequest);
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

    return () => {
      socket.off("send_request", receiveRequest);
    };
  }, [socket, isCalling]);

  useEffect(() => {
    // if (openPermission && caller && state.mailNotification.length > 0) {
    //   dispatch(setInComingCall(true));
    // }
    if (openPermission && state.mailNotification.length > 0) {
      dispatch(setInComingCall(true));
    }
  }, [openPermission, state.mailNotification]);

  useEffect(() => {
    if (inComingCall && !isCalling) {
      playRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [inComingCall]);

  useEffect(() => {
    if (callerRequest) {
      setCallerInfo(callerRequest);
      setCallee({
        name: callerRequest.caller,
        mailType: callerRequest.mailType,
      });
    } else {
      setCallerInfo(null);
      setCallee(null);
    }
  }, [callerRequest]);

  useEffect(() => {
    console.log("NOTIFICATION: ", state.mailNotification);
  }, [state.mailNotification]);

  // ISSUE 1: IN GROUP VIDEO CHAT 2nd CALL, IN CALLER, SOMETIMES TWO CALLEE POP UP ON VIDEO

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
        checkNotificationReceiver() &&
        callerInfo && <Notification caller={callerInfo} />}
      {modal ? <Modal /> : null}
    </div>
  );
}

export default ChatRoom;
