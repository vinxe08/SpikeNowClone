import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";
import { setIsCalling } from "../../../features/show/showSlice";

export function useVideoChat() {
  const dispatch = useDispatch();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  const user = useSelector((state) => state.emailReducer.user.email);
  const state = useSelector((state) => state.emailReducer.email);
  const allRecipients = useSelector((state) => state.emailReducer.recipients);

  const recipient = allRecipients?.filter(
    (data) =>
      data.users.includes(
        state?.[0].header.from?.[0]?.email || state?.[0].header.from?.[0]
      ) &&
      data.users.includes(
        state?.[0].header.to?.[0]?.email || state?.[0].header.to?.[0]
      )
  );

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        console.log("RECIPIENTS", recipient);
        // REGISTER IN SERVER - USER TO RECEIVER
        socketRef.current.emit("join room", { roomID: recipient[0]._id, user }); // RECIPIENT IS NOT FOR SPECIFIC ID FOR EMAIL/CONTACT

        // POV: RECEIVER
        socketRef.current.on("all users", (users) => {
          console.log("ALL USERS: ", users);
          const peers = [];
          users.forEach((user) => {
            const peer = createPeer(user.userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: user.userID,
              peer,
              user: user.user,
            });
            peers.push({ peer, user: user.user, peerID: user.userID });
          });
          setPeers(peers);
        });

        // POV: USER
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
          setTimeout(() => {
            item.peer.signal(payload.signal);
          }, 1000);
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          // TRY TO ADD A DESTTROY FUNCTION.
          // if (peerObj.peer) {
          //   peerObj.peer.on("error", (err) => {
          //     console.log("USER LEFT ERROR: ", err);
          //   });
          //   peerObj.peer.destroy();
          //   peerObj.peer.on("error", (err) => {
          //     console.log("USER LEFT ERROR: ", err);
          //   });
          // }

          // if (typeof process !== "undefined") {
          //   peerObj.peer.destroy();
          //   console.log("PEER 1 DESTROY");
          // }
          console.log("PEER OBJ: ", peerObj);
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });
      })
      .catch((error) => console.log("ERROR: ", error)); // Add an Error animation
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      // RECEIVER TO USER
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        user,
      });
    });

    peer.on("error", (err) => {
      console.log("CREATE PEER ERROR: ", err);
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      // USER TO RECEIVER
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("error", (err) => {
      console.log("ADD PEER ERROR: ", err);
    });

    setTimeout(() => {
      peer.signal(incomingSignal);
    }, 1000);

    return peer;
  }

  const leaveCall = () => {
    socketRef.current.emit("leave call");
    if (userVideo.current) {
      userVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      dispatch(setIsCalling(false));
      // peers.map((peer) => peer.destroy());
    }

    // if (typeof process !== "undefined") {
    //   peers.map((peer) => peer.destroy());
    //   console.log("PEER DESTROY 2");
    // }
  };

  return {
    userVideo,
    peers,
    leaveCall,
  };
}
