import React, { useEffect, useRef } from "react";
import { IoMdResize } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { setIsCalling } from "../../../features/show/showSlice";
import { useVoiceChat } from "./useVoiceChat";
import "./VoiceChatPage.css";

const Audio = ({ voice }) => {
  const ref = useRef();

  useEffect(() => {
    voice.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [voice]);

  return (
    <div className="recipient__voice">
      <h1 className="voice__user">{voice.user}</h1>
      <audio className="voice__camera" playsInline ref={ref} autoPlay />
    </div>
  );
};

function VoiceChatPage() {
  const { socket } = useOutletContext();
  const user = useSelector((state) => state.emailReducer.user.email);
  const { userVoice, peers, leaveCall } = useVoiceChat();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   socket.on("end_call", () => {
  //     dispatch(setIsCalling(false));

  //     window.location.reload();
  //   });
  // }, [socket]);

  return (
    <div className="VoiceChatPage">
      <div className="voicecall__container">
        <div className="voice__header">
          {/* <div className="close" onClick={leaveCall}> */}
          <div className="close" onClick={leaveCall}>
            <IoClose />
          </div>
          <div
          // className=""
          // onClick={() => dispatch(hideContactInfo())}
          >
            <IoMdResize />
          </div>
        </div>

        <div className="voicecall__setup">
          <h1>THIS IS VOICE CHAT</h1>
          {/* ISSUE: stream is undefined at first render */}
          {userVoice && (
            <div className="my__voice">
              <h1 className="voice__user">{user}</h1>
              <audio
                className="voice__camera"
                playsInline
                muted
                ref={userVoice}
                autoPlay
              />
            </div>
          )}

          {peers.map((voice) => (
            <Audio key={voice.peerID} voice={voice} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceChatPage;
