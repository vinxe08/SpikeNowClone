import React, { useEffect, useRef } from "react";
import { IoMdResize } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useVoiceChat } from "./useVoiceChat";
import "./VoiceChatPage.css";

const Audio = ({ voice }) => {
  const ref = useRef();

  useEffect(() => {
    voice.peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [voice]);

  return (
    <div className="recipient__voice">
      <h1 className="voice__user">{voice.user}</h1>
      {ref && (
        <audio className="voice__camera" playsInline ref={ref} autoPlay />
      )}
    </div>
  );
};

function VoiceChatPage() {
  const user = useSelector((state) => state.emailReducer.user.email);
  const { userVoice, peers, leaveCall } = useVoiceChat();

  return (
    <div className="VoiceChatPage">
      <div className="voicecall__container">
        <div className="voice__header">
          <div className="close" onClick={leaveCall}>
            <IoClose />
          </div>
          <div>
            <IoMdResize />
          </div>
        </div>

        <div className="voicecall__setup">
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

          {peers
            .filter((peer) => peer.user !== user)
            .map((voice) => (
              <Audio key={voice.peerID} voice={voice} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceChatPage;
