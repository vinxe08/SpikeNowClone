import React, { useEffect, useState } from "react";
import "./GroupList.css";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { IoHome } from "react-icons/io5";
import { GiBlackBook, GiPalmTree } from "react-icons/gi";
import { BiBasketball } from "react-icons/bi";
import { FaGlassCheers } from "react-icons/fa";
import { MdGroupAdd } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setModal } from "../../../features/navigate/menuSlice";
import {
  getEmail,
  setReciever,
  setRecipient,
  setToggle,
} from "../../../features/email/emailSlice";
import { useOutletContext } from "react-router-dom";

function GroupList() {
  const user = useSelector((state) => state.emailReducer.user);
  const modal = useSelector((state) => state.menuReducer.modalCreate);
  const [results, setResults] = useState(null);
  const dispatch = useDispatch();
  const state = useSelector((state) => state.emailReducer);
  const [emailState, setEmailState] = useState(state);
  const { socket } = useOutletContext();

  // console.log("EMAIL STATE: ", emailState);

  // TODO: Display all the Group that the user is in.
  // REMOVE THIS. GET THE DATA FROM ChatRoom.jsx(data.groups)
  // const fetchAllGroups = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3001/group/retrieve", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: user.email,
  //       }),
  //     });
  //     const data = await response.json();
  //     setResults(data.group);
  //     console.log("GROUP LIST: ", data.group);
  //   } catch (error) {}
  // };

  const groupSet = new Set(
    emailState.groupEmail.map((item) => `${item.groupName}: ${item._id}`)
  );

  // console.log("GROUP SET: ", groupSet);

  // Returns all the email that has group
  const emailSet = emailState.allEmail.filter(
    (item) =>
      item.header.subject &&
      item.header.subject.some((subject) => groupSet.has(subject))
  );

  // console.log("EMAIL SET", emailSet);

  const groupedEmail = emailSet.map((data) => {
    const [groupName, id] = data.header.subject[0].split(": ");
    const myGroup = emailState.groupEmail.filter(
      (item) => item.groupName === groupName && item._id === id
    );

    return {
      ...data,
      data: myGroup[0],
    };
  });

  const noEmail = emailState.groupEmail.map((data) => {
    // console.log("MAP: ", data);
    const samp = groupedEmail.filter((item) => item.data._id === data._id);

    if (samp.length > 0) {
      // console.log("IF: ", samp);
      return samp[0];
    } else {
      const recipient = data.users.filter(
        (name) => name !== emailState.user.email
      );
      const to = recipient.join(", ");
      // console.log("ELSE: ", to);
      return {
        data,
        header: {
          from: [{ email: emailState.user.email }],
          date: [data.timestamp],
          subject: [`${data.groupName}: ${data._id}`],
          to: [{ email: `${to}` }],
          type: "group",
        },
      };
    }
  });

  const onMessageSelect = (email) => {
    dispatch(setToggle("group"));
    console.log("ON SELECT: ", email);
    dispatch(
      setReciever([
        {
          groupName: email.data.groupName,
          users: email.data.users,
          _id: email.data._id,
        },
      ])
    );
    dispatch(
      setRecipient([
        {
          groupName: email.data.groupName,
          users: email.data.users,
          _id: email.data._id,
        },
      ])
    );
    // TODO: This should get the email like in MessageList.jsx -> dispatchEmail()
    dispatch(getEmail([email])); // user the data.conversation for email and use the rest for ContactInfo & ReplyField

    // ADD WEB SOCKETS
    socket.emit("select_conversation", email.data._id);
  };

  useEffect(() => {
    setEmailState(state);
    // console.log("USE EFFECT");
  }, [modal]);

  // useEffect(() => {
  //   fetchAllGroups();
  // }, []);

  return (
    <div className="GroupList">
      <div onClick={() => dispatch(setModal(true))} className="group__iconrow">
        <div className="group__icon">
          <MdGroupAdd />
        </div>
        <h1 className="group__icontext">Create Group</h1>
      </div>
      {noEmail.length > 0 && (
        <div>
          <h1 className="group__divider">RECENT</h1>
          {noEmail.map((result) => (
            <div
              onClick={() => onMessageSelect(result)}
              key={result.header.date[0]}
              className="group__iconrow"
            >
              <div
                className={`group__userAvatar icon__white ${result.data.background}`}
              >
                {result.data.groupName[0]}
              </div>
              <h1 className="group__icontext">{result.data.groupName}</h1>
            </div>
          ))}
        </div>
      )}

      <h1 className="group__divider">CREATE GROUP</h1>

      <div className="group__iconrow">
        <div className="group__icon icon__white green__bg">
          <BsFillRocketTakeoffFill />
        </div>
        <h1 className="group__icontext">Project</h1>
      </div>

      <div className="group__iconrow">
        <div className="group__icon icon__white pink__bg">
          <IoHome />
        </div>
        <h1 className="group__icontext">Family</h1>
      </div>

      <div className="group__iconrow">
        <div className="group__icon icon__white green__bg">
          <GiBlackBook />
        </div>
        <h1 className="group__icontext">Study Group</h1>
      </div>

      <div className="group__iconrow">
        <div className="group__icon icon__white yellow__bg">
          <BiBasketball />
        </div>
        <h1 className="group__icontext">Sports Team</h1>
      </div>

      <div className="group__iconrow">
        <div className="group__icon icon__white voilet__bg">
          <FaGlassCheers />
        </div>
        <h1 className="group__icontext">Party</h1>
      </div>

      <div className="group__iconrow">
        <div className="group__icon icon__white darkblue__bg">
          <GiPalmTree />
        </div>
        <h1 className="group__icontext">Vacation</h1>
      </div>
    </div>
  );
}

export default GroupList;
