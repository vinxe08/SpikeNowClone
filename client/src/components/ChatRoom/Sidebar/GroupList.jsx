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
  const [results, setResults] = useState([]);
  const dispatch = useDispatch();
  const state = useSelector((state) => state.emailReducer);
  const [emailState, setEmailState] = useState(state);
  const { socket } = useOutletContext();

  const groupSet = new Set(
    emailState.groupEmail.map((item) => `${item.groupName}: ${item._id}`)
  );

  // Returns all the email that has group
  const emailSet = emailState.allEmail.filter(
    (item) =>
      item.header.subject &&
      item.header.subject.some((subject) => groupSet.has(subject))
  );

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
    const samp = groupedEmail.filter((item) => item.data._id === data._id);

    if (samp.length > 0) {
      return samp[0];
    } else {
      const recipient = data.users.filter(
        (name) => name !== emailState.user.email
      );
      const to = recipient.join(", ");

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
    dispatch(getEmail([email]));

    socket.emit("select_conversation", email.data._id);
  };

  useEffect(() => {
    setEmailState(state);
  }, [modal]);

  useEffect(() => {
    socket.on("new group", (data) => {
      const recipient = data.users.filter(
        (name) => name !== emailState.user.email
      );
      const to = recipient.join(", ");
      setResults((prevResult) => [
        ...prevResult,
        {
          data,
          header: {
            from: [{ email: emailState.user.email }],
            date: [data.timestamp],
            subject: [`${data.groupName}: ${data._id}`],
            to: [{ email: `${to}` }],
            type: "group",
          },
        },
      ]);
    });
  }, [socket]);

  useEffect(() => {
    setResults(noEmail);
  }, []);

  return (
    <div className="GroupList">
      <div onClick={() => dispatch(setModal(true))} className="group__iconrow">
        <div className="group__icon">
          <MdGroupAdd />
        </div>
        <h1 className="group__icontext">Create Group</h1>
      </div>
      {results.length > 0 && (
        <div>
          <h1 className="group__divider">RECENT</h1>
          {results.map((result) => (
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
