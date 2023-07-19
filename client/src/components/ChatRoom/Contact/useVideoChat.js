import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import Peer from "simple-peer";
import { setIsCalling } from "../../../features/show/showSlice";

export function useVideoChat() {
  const { socket } = useOutletContext();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [call, setCall] = useState({});
  const dispatch = useDispatch();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const user = useSelector((state) => state.emailReducer.user);
  const state = useSelector((state) => state.emailReducer.email);
  const allRecipients = useSelector((state) => state.emailReducer.recipients);
  const recipient = allRecipients?.filter(
    (data) =>
      data.users.includes(state?.[0].header.from?.[0]?.email) &&
      data.users.includes(state?.[0].header.to?.[0]?.email)
  );

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
      })
      .catch((error) => console.log("ERROR: ", error));

    socket.on("receive_request", ({ signal, email, type }) => {
      setCall({ isReceivingCall: true, email, signal, type });
    });
  }, []);

  useEffect(() => {
    if (stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    socket.on("end_call", () => {
      // Add animation for exit

      setStream(null);
      setCallEnded(true);
      dispatch(setIsCalling(false));
      window.location.reload();
    });
  }, [socket]);

  const joinRoom = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("video_request", {
        id: recipient[0]._id,
        // name: state[0].header.to[0]?.name,
        email: user.email,
        type: "Video Call",
        signalData: data,
      });
    });
    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("call_accepted", (data) => {
      // add email here for who accept
      setCall({ email: data.callee, type: "Video Call" });
      setCallAccepted(true);
      peer.signal(data.signal);
    });

    connectionRef.current = peer;
  };

  // Answer Call
  const callResponse = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("accept_call", {
        callee: user.email,
        signal: data,
        to: recipient[0]._id,
      });
    });
    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    console.log("LEAVE CALL");
    setStream(null);
    setCallEnded(true);
    dispatch(setIsCalling(false));

    socket.emit("end_call", { id: recipient[0]._id, disconnect: true });

    window.location.reload();
  };

  return {
    stream,
    call,
    callAccepted,
    callEnded,
    myVideo,
    userVideo,
    leaveCall,
    joinRoom,
    callResponse,
  };
}

// Usage:
// Import the useVideoChat function into your component
// Then, destructure the required functions and variables from the returned object

// Example:
// const { answerCall, callUser, leaveCall } = useVideoChat();
