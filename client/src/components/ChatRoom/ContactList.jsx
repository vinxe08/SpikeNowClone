import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";
import {
  addAllEmail,
  addEmail,
  pushNotification,
  setRecipient,
} from "../../features/email/emailSlice";
import MessageList from "./Sidebar/MessageList";
import { Toast } from "../../lib/sweetalert";
import { connectionError } from "../../lib/connectionError";
import { debounce } from "../../lib/debounce";

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
      return (
        item?.header?.subject?.[0] &&
        data?.[0]?.header?.subject?.[0] === item?.header?.subject?.[0]
      );
    });

    const hasGroup = groupFilterer?.find(
      (obj) =>
        obj?.header?.subject?.[0] &&
        obj?.header?.subject?.[0] === item?.header?.subject?.[0]
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
      const response = await fetch(
        `/${process.env.REACT_APP_CONVERSATION_GET}`,
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

  const handleIncomingEmail = debounce((mails) => {
    mails.slice(-1).map((newEmail) => {
      const getSender = newEmail.header.from[0].match(/<([^>]+)>/)?.[1];
      const groupReceiver = newEmail.header.to[0].split(", ");

      // FOR GROUP MAIL
      if (groupReceiver.length > 1 && newEmail.header.subject.length > 0) {
        // if (
        //   !sortData[newEmail.header.subject[0]]?.some(
        //     (data) =>
        //       data.body === newEmail.body &&
        //       data.header.date[0] === newEmail.header.date[0]
        //   )
        // ) {
        // sortData[newEmail.header.subject[0]].push(newEmail);
        // setResult(sortData);
        // dispatch(addAllEmail(newEmail));

        setResult((prevState) => {
          return {
            ...prevState,
            [newEmail.header.subject[0]]: [
              ...prevState[newEmail.header.subject[0]],
              newEmail,
            ],
          };
        });
        // }

        // FOR WHEN THE MAIL IS SHOWN/OPEN
        if (
          email.email.length > 0 &&
          email?.email?.[0]?.header.subject?.[0] === newEmail.header.subject[0]
          //   &&
          // !email.email.some(
          //   (data) =>
          //     data.body === newEmail.body &&
          //     data.header.date[0] === newEmail.header.date[0]
          // )
        ) {
          dispatch(addEmail(newEmail));
        }

        // For Notification
        if (
          email.email.length === 0 &&
          // !email.mailNotification?.includes(newEmail.header.subject[0])
          email?.email?.[0]?.header.subject?.[0] !== newEmail.header.subject[0]

          // !email.email[0] ||
          // email.email[0] !== sortData[newEmail.header.from[0]][0]
        ) {
          dispatch(
            pushNotification({
              name: newEmail.header.subject[0],
              type: "group",
            })
          );
        }
      } else {
        // // FOR WHEN THE MAIL IS SHOWN/OPEN
        if (
          // !sortData[newEmail.header.from[0]].some(
          //   (data) =>
          //     data.body === newEmail.body &&
          //     data.header.date[0] === newEmail.header.date[0]
          // ) &&
          email.email[0] === sortData[newEmail.header.from[0]][0]
        ) {
          dispatch(addEmail(newEmail));
        }

        // For Notification
        if (
          !email.email[0] ||
          email.email[0] !== sortData[newEmail.header.from[0]][0]
        ) {
          dispatch(
            pushNotification({ name: newEmail.header.from[0], type: "single" })
          );
        }

        // For Pushing data in contact list
        if (
          sortData.hasOwnProperty(newEmail.header.from[0])
          // &&
          // !sortData[newEmail.header.from[0]].some(
          //   (data) =>
          //     data.body === newEmail.body &&
          //     data.header.date[0] === newEmail.header.date[0]
          // )
        ) {
          // sortData[newEmail.header.from[0]].push(newEmail);
          // setResult(sortData);
          setResult((prevState) => {
            return {
              ...prevState,
              [newEmail.header.from[0]]: [
                ...prevState[newEmail.header.from[0]],
                newEmail,
              ],
            };
          });
          // dispatch(addAllEmail(newEmail));
        }
        // else if (
        //   !sortData.hasOwnProperty(getSender || newEmail.header.from[0]) &&
        //   !sortData[getSender || newEmail.header.from[0]].some(
        //     (data) =>
        //       data.body === newEmail.body &&
        //       data.header.date[0] === newEmail.header.date[0]
        //   )
        // ) {
        //   sortData[getSender || newEmail.header.from[0]] = [];
        //   sortData[getSender || newEmail.header.from[0]].push(newEmail);
        //   setResult(sortData);
        //   dispatch(addAllEmail(newEmail));
        // }
      }
    });
  }, 1000);

  useEffect(() => {
    conversations();
    setResult(sortData);
  }, []);

  useEffect(() => {
    setResult(sortData);
  }, [email.groupEmail, email.allEmail]);

  useEffect(() => {
    socket.on("new email", handleIncomingEmail);
    socket.on("connection error", connectionError);

    return () => {
      socket.off("new email", handleIncomingEmail);
      socket.off("connection error", connectionError);
    };
  }, [socket, email.email, result]);

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
