import React, { useEffect, useState } from "react";
import "./ReplyField.css";
import { BiExpandAlt, BiSmile } from "react-icons/bi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdElectricBolt } from "react-icons/md";
import { FaComment } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addAllEmail, addEmail } from "../../../features/email/emailSlice";
import Swal from "sweetalert2";
import { Toast } from "../../../lib/sweetalert";

function ReplyField() {
  const state = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [subject, setSubject] = useState("");
  const hasType = state.email.filter((item) => item.header.type);

  function formatDateToCustomString(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }

  const emailReceiver = () => {
    // FOR GROUP EMAIL
    if (state.email[0].header.type === "group") {
      setReceiver(
        state.email[0].data.users.filter((mail) => mail !== state.user.email)
      );
      setSubject(state.email[0].header.subject[0]);
    }
    // FOR SINGLE USER
    else {
      setReceiver(() => {
        if (state.email[0].header.from[0].email !== state.user.email) {
          return state.email[0].header.from[0].email;
        } else {
          return state.email[0].header.to[0].email;
        }
      });

      setSubject("");
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(
        `/${process.env.REACT_APP_CONVERSATION_SEND}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...state.user,
            receiver: receiver,
            message,
            subject,
          }),
        }
      );
      const data = await response.json();

      if (!data.error) {
        dispatch(
          addEmail({
            body: message,
            header: {
              date: [formatDateToCustomString(new Date())],
              from: [{ email: state.user.email }],
              subject: [subject],
              to: [{ email: receiver }],
            },
          })
        );
        dispatch(
          addAllEmail({
            body: message,
            header: {
              date: [formatDateToCustomString(new Date())],
              from: [{ email: state.user.email }],
              subject: [subject],
              to: [{ email: receiver }],
            },
          })
        );
        setMessage("");
        Swal.close();
        Toast.fire({
          icon: "success",
          title: "Message sent",
        });
      } else {
        Swal.close();
        Toast.fire({
          icon: "error",
          title: "Something is wrong. Try Again",
        });
      }
    } catch (error) {
      console.log("ERROR: ReplyField -> ", error);
      Swal.close();
      Toast.fire({
        icon: "error",
        title: "Something is wrong. Try Again",
      });
      setMessage("");
    }
  };

  useEffect(() => {
    emailReceiver();
  }, [state.email]);

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
              hasType.length > 0
                ? hasType[0].header.subject[0].replace(
                    `: ${hasType[0].data._id}`,
                    ""
                  )
                : state.email?.[0]?.header?.from?.[0]?.name ||
                  state.email?.[0]?.header?.from?.[0]?.email ||
                  state.email?.[0]?.header?.subject?.[0] ||
                  "User"
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

export default ReplyField;
