import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";
import {
  setCall,
  setIsCalling,
  setOnCall,
} from "../../../features/show/showSlice";
import { Toast } from "../../../lib/sweetalert";
import { getTurnCredentials } from "../../../lib/twilio";

export function useVideoChat() {
  const dispatch = useDispatch();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [iceServers, setIceServers] = useState([]);

  const user = useSelector((state) => state.emailReducer.user.email);
  const recipient = useSelector((state) => state.emailReducer.recipients);

  // Fetch the twilio data
  const fetchTurn = async () => {
    try {
      const data = await getTurnCredentials();
      setIceServers(data.token.iceServers);
    } catch (error) {
      setIceServers({ error });
    }
  };

  useEffect(() => {
    fetchTurn();
  }, []);

  useEffect(() => {
    if (iceServers.length > 0) {
      window.addEventListener("beforeunload", leaveCall);

      socketRef.current = io.connect(`${process.env.REACT_APP_SOCKET}`, {
        withCredentials: true,
      });

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
          // REGISTER IN SERVER - USER TO RECEIVER
          socketRef.current.emit("join room", {
            roomID: recipient[0]._id,
            user,
          });

          // GET ALL THE USER's PEER in SERVER
          socketRef.current.on("all users", (users) => {
            const peers = [];
            users.forEach((user) => {
              const peer = createPeer(
                user.userID,
                socketRef.current.id,
                stream
              );
              peersRef.current.push({
                peerID: user.userID,
                peer,
                user: user.user,
              });
              peers.push({ peer, user: user.user, peerID: user.userID });
            });

            setPeers(peers);
          });

          // ADD's THE INCOMING PEER/USER
          socketRef.current.on("user joined", (payload) => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
              user: payload.user,
            });

            setPeers((users) => [
              ...users,
              { peer, user: payload.user, peerID: payload.callerID },
            ]);
          });

          socketRef.current.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);

            item.peer.signal(payload.signal);
          });

          socketRef.current.on("user left", (id) => {
            const peerObj = peersRef.current.find((p) => p.peerID === id);

            if (peerObj) {
              peerObj.peer.destroy();
            }

            const peers = peersRef.current.filter((p) => p.peerID !== id);
            peersRef.current = peers;
            setPeers(peers);
          });
        })
        .catch((error) => {
          console.log("GET USER MEDIA: ", error);
          Toast.fire({
            icon: "error",
            title: "Error. Try Again Later",
          });
        });

      const userVideoRef = userVideo.current;

      return () => {
        // FOR CLEAN UP
        if (userVideoRef) {
          const stream = userVideoRef.srcObject;
          if (stream) {
            // Stop the media stream
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
          }

          userVideoRef.srcObject = null;
        }

        window.removeEventListener("beforeunload", leaveCall);
      };
    }
  }, [iceServers]);

  // Create a PEER Connection and send in SERVER
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [...iceServers, { url: "stun:stun.1und1.de:3478" }], // ADDITION
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        user,
      });
    });

    peer.on("error", (err) => {
      console.log("CREATE PEER ERROR: ", err);
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
    });

    return peer;
  }

  // ADD ALL THE PEER THAT IS IN SERVER EXCLUDE ME/USER
  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [...iceServers, { url: "stun:stun.1und1.de:3478" }],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("error", (err) => {
      console.log(err);
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
    });

    setTimeout(() => {
      peer.signal(incomingSignal);
    }, 1000);

    return peer;
  }

  // For Leaving the Call
  const leaveCall = () => {
    socketRef.current.emit("leave call");
    if (userVideo.current) {
      userVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      dispatch(setIsCalling(false));
    }
    dispatch(setOnCall(false));
    dispatch(setCall(null));
    setPeers(null);
  };

  return {
    userVideo,
    peers,
    leaveCall,
  };
}
