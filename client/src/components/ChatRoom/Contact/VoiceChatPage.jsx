import React, { useEffect, useState } from "react";
import { IoMdResize } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { setIsCalling } from "../../../features/show/showSlice";
import { useVideoChat } from "./useVideoChat";
import "./VoiceChatPage.css";

function VoiceChatPage() {
  const user = useSelector((state) => state.emailReducer.user.email);
  const dispatch = useDispatch();
  const [userJoined, setUserJoined] = useState(false);
  const { socket } = useOutletContext();
  // const {
  //   stream,
  //   call,
  //   callAccepted,
  //   callEnded,
  //   myVideo,
  //   userVideo,
  //   joinRoom,
  //   callResponse,
  //   leaveCall,
  // } = useVideoChat();

  // const closeCall = () => {
  //   dispatch(setIsCalling(false));

  //   const myStream = myVideo.current.srcObject;
  //   const tracks = myStream.getTracks();

  //   tracks.forEach((track) => {
  //     track.stop();
  //   });

  //   myVideo.current.srcObject = null;

  //   // SEND NOTIFICATION THAT WILL CLOSE THE CONNECTION
  // };

  const join = () => {
    // callResponse();
    setUserJoined(true);
  };

  // useEffect(() => {
  // socket.on("when_accept", (data) => {
  //   if (stream) {
  //     joinRoom();
  //   }
  //   // console.log("when_accept: for sender: ", data);
  // });
  // }, [stream]);

  return (
    <div className="VideoCallPage">
      <div className="videocall__container">
        <div className="video__header">
          {/* <div className="close" onClick={leaveCall}> */}
          <div className="close" onClick={() => console.log("LOGIN")}>
            <IoClose />
          </div>
          <div
          // className=""
          // onClick={() => dispatch(hideContactInfo())}
          >
            <IoMdResize />
          </div>
        </div>
        {/* BEFORE JOIN */}

        <div className="videocall__setup">
          <h1>THIS IS VOICE CHAT</h1>
          {/* ISSUE: stream is undefined at first render */}
          {/* {stream && myVideo && (
            <div className="my__video">
              <h1 className="video__user">{user}</h1>
              <video
                className="video__camera"
                playsInline
                muted
                ref={myVideo}
                autoPlay
              />
            </div>
          )} */}
          {/* {callAccepted && !callEnded && userVideo && (
            <div className="recipient__video">
              <h1 className="video__user">{call?.email}</h1>
              <video
                className="video__camera"
                playsInline
                ref={userVideo}
                autoPlay
              />
            </div>
          )} */}
        </div>
        {/* )} */}
      </div>
    </div>
  );
}

export default VoiceChatPage;
