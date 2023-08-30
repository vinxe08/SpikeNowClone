import React, { useEffect, useState } from "react";
import "./ReplyGroup.css";
import { BiExpandAlt, BiSmile } from "react-icons/bi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdElectricBolt } from "react-icons/md";
import { FaComment } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addEmail } from "../../../features/email/emailSlice";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import { Toast } from "../../../lib/sweetalert";

function ReplyGroup() {
  const { socket } = useOutletContext();
  const state = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  // console.log("Reply Field: ", state);

  const sendEmail = async (e) => {
    // CHANGE THIS: Use the groupconversations.conversation in DB
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await fetch("http://localhost:3001/group/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ...state.user,
          // receiver: state.email[0].header.from[0].email, // UPDATE THIS
          message,
        }),
      });
      const data = await response.json();

      if (data) {
        // UPDATE THIS FOR GROUP !!!
        await socket.emit("send_email", state.recipients[0]._id, {
          body: message,
          header: {
            date: new Date(),
            from: state.email[0].header.to,
            subject: "",
            to: state.email[0].header.from,
          },
        });
        dispatch(
          addEmail({
            body: message,
            header: {
              date: [`${new Date()}`],
              from: state.email[0].header.to,
              subject: "",
              to: state.email[0].header.from,
            },
          })
        );
        setMessage("");
        Swal.close();
        Toast.fire({
          icon: "success",
          title: "Message sent",
        });
      }
    } catch (error) {
      console.log("CATCH: ", error);
      Swal.close();
      Toast.fire({
        icon: "error",
        title: "Something is wrong. Try Again",
      });
      setMessage("");
    }
  };

  return (
    <div className="ReplyField">
      <div className="reply__field">
        <FaComment />
        <form onSubmit={sendEmail} action="" className="form__field">
          <input
            type="text"
            className="reply__input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message to ${
              state.email?.[0]?.header?.from?.[0]?.name ||
              state.receiver.groupName
            }`}
          />
          <input hidden type="submit" disabled={message === ""} />
        </form>
      </div>
      <div className="reply__icons">
        <BiExpandAlt />
        <div className="mini__icons">
          <AiOutlinePlusCircle />
        </div>
        <div className="mini__icons">
          <BiSmile />
        </div>
        <div className="mini__icons electric">
          <MdElectricBolt />
        </div>
      </div>
    </div>
  );
}

export default ReplyGroup;
