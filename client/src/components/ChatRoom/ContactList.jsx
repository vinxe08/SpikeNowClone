import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";
import { getEmail, setRecipient } from "../../features/email/emailSlice";
import MessageList from "./Sidebar/MessageList";
import { Toast } from "../../lib/sweetalert";
import { connectionError } from "../../lib/connectionError";

function ContactList() {
  const email = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const [result, setResult] = useState(null);

  const groupFilterer = email?.groupEmail?.map((item) => {
    return {
      data: item,
      header: {
        date: [item.timestamp],
        from: [email.user.email],
        subject: [`${item.groupName}: ${item._id}`],
        to: item.users,
        type: "group",
      },
    };
  });

  const emailConcat = email.allEmail.concat(groupFilterer);

  // Groups all email according to email address
  const sortData = emailConcat.reduce((groups, item) => {
    const category = item?.header?.from[0]?.email;
    const receiver = item?.header.to?.[0].email;
    const user = email.user.email;

    const isInGroup = Object.values(groups).filter((data) => {
      return data[0].header.subject[0] === item.header.subject?.[0];
    });

    const hasGroup = groupFilterer?.find(
      (obj) => obj.header.subject[0] === item.header?.subject?.[0]
    );

    if (hasGroup) {
      if (!groups[item.header?.subject?.[0]]) {
        groups[item.header?.subject?.[0]] = [];
        groups[item.header?.subject?.[0]].push(hasGroup);
      }
      groups[item.header?.subject?.[0]].push(item);
    }
    // FOR USER
    else if (category === user || receiver !== user) {
      if (isInGroup.length > 0) {
        let mailInfo;

        // ADD: CHECK FOR receiver !== user
        if (isInGroup[0][0].header.from[0].email === user) {
          mailInfo = isInGroup[0][0].header.to[0].email;
        } else {
          mailInfo = isInGroup[0][0].header.from[0].email;
        }

        if (!groups[mailInfo]) {
          groups[mailInfo] = [];
        }
        groups[mailInfo].push(item);
      } else {
        if (!groups[receiver]) {
          groups[receiver] = [];
        }
        groups[receiver].push(item);
      }
    } else {
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    }

    return groups;
  }, {});

  // FETCH ALL THE CONVERSATIONS
  const conversations = async () => {
    try {
      // THIS IS ONLY FOR SINGLE PEER | CHECK IF IT IS FOR GROUP OR SINGLE
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CONVERSATION_GET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: email.user.email,
          }),
        }
      );
      const data = await response.json();
      dispatch(setRecipient(data));
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
    }
  };

  // Custom comparison function to sort dates
  function compareDates(a, b) {
    const dateA = new Date(a.slice(-1)[0].header.date[0]);
    const dateB = new Date(b.slice(-1)[0].header.date[0]);

    return dateB - dateA;
  }

  useEffect(() => {
    conversations();
    setResult(sortData);
  }, []);

  useEffect(() => {
    const handleIncomingEmail = (newEmail) => {
      const getSender = newEmail.header.from[0].match(/<([^>]+)>/)?.[1]; // getSender is undefined if it is for group
      const groupReceiver = newEmail.header.to[0].split(", ");

      // Check if it is for group or it has more than 1 receiver
      if (groupReceiver) {
        dispatch(getEmail([...sortData[newEmail.header.subject[0]], newEmail]));

        setResult((prevState) => {
          // Check if it is already in contact/message list
          if (prevState.hasOwnProperty(newEmail.header.subject[0])) {
            return {
              ...prevState,
              [newEmail.header.subject[0]]: [
                ...prevState[newEmail.header.subject[0]],
                newEmail,
              ],
            };
          } else {
            return {
              ...prevState,
              [newEmail.header.subject[0]]: [newEmail],
            };
          }
        });
      } else {
        setResult((prevState) => {
          // If it is already in contact/message list
          if (prevState.hasOwnProperty(getSender || newEmail.header.to[0])) {
            return {
              ...prevState,
              [getSender || newEmail.header.to[0]]: [
                ...prevState[getSender || newEmail.header.to[0]],
                newEmail,
              ],
            };
          } else {
            return {
              ...prevState,
              [getSender || newEmail.header.to[0]]: [newEmail],
            };
          }
        });
      }
    };

    socket.on("new email", handleIncomingEmail);
    socket.on("connection error", connectionError);

    return () => {
      socket.off("new email", handleIncomingEmail);
      socket.off("connection error", connectionError);
    };
  }, [socket]);

  return (
    <>
      <div className="Message__List">
        {email.allEmail?.length > 0 ? (
          <div>
            <h1 className="chatroom__today">Today</h1>
            {result &&
              Object.values(result)
                .sort(compareDates)
                .map((mail, index) => <MessageList key={index} email={mail} />)}
          </div>
        ) : (
          <div className="loading__icon">
            <FadeLoader
              color="#1E90FF"
              loading={true}
              size={100}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default ContactList;
