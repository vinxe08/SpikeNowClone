import React, { useEffect, useRef } from "react";
import { IoMdResize } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import "./VideoCallPage.css";
import { useVideoChat } from "./useVideoChat";

const Video = ({ video }) => {
  const ref = useRef();

  useEffect(() => {
    if (video.peer) {
      video.peer.on("stream", (stream) => {
        if (ref.current) {
          ref.current.srcObject = stream;
        }
      });
    }
  }, [video]);

  return (
    <div className="recipient__video">
      <h1 className="video__user">{video.user}</h1>
      {ref && (
        <video className="video__camera" playsInline ref={ref} autoPlay />
      )}
    </div>
  );
};

function VideoCallPage() {
  const user = useSelector((state) => state.emailReducer.user.email);

  const { userVideo, peers, leaveCall } = useVideoChat();

  return (
    <div className="VideoCallPage">
      <div className="videocall__container">
        <div className="video__header">
          <div className="close" onClick={leaveCall}>
            <IoClose />
          </div>
          <div>
            <IoMdResize />
          </div>
        </div>

        <div className="videocall__setup">
          {userVideo && (
            <div className="my__video">
              <h1 className="video__user">{user}</h1>
              <video
                className="video__camera"
                playsInline
                muted
                ref={userVideo}
                autoPlay
              />
            </div>
          )}

          {peers.map((video) => (
            <Video key={video.peerID} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoCallPage;
