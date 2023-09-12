import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";
import { addEmail, setRecipient } from "../../features/email/emailSlice";
import MessageList from "./Sidebar/MessageList";

function ContactList() {
  const email = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const [result, setResult] = useState(null);
  // console.log("ContactList: ", email);
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
    // console.log("ITEM: ", item);
    const category = item?.header?.from[0]?.email;
    const receiver = item?.header.to?.[0].email;
    const user = email.user.email;

    const isInGroup = Object.values(groups).filter((data) => {
      return data[0].header.subject[0] === item.header.subject?.[0];
    });

    const hasGroup = groupFilterer?.find(
      (obj) => obj.header.subject[0] === item.header?.subject?.[0]
    );
    // console.log("GROUP: ", groupFilterer);

    // if (groupFilterer.length > 0 && hasGroup) {
    // FOR GROUP EMAIL
    if (hasGroup) {
      // console.log("HAS GROUP: ", item);
      if (!groups[item.header?.subject?.[0]]) {
        groups[item.header?.subject?.[0]] = [];
        groups[item.header?.subject?.[0]].push(hasGroup);
        // console.log("HAS GROUP: ", hasGroup);
      }
      groups[item.header?.subject?.[0]].push(item);
    }
    // FOR USER
    else if (category === user || receiver !== user) {
      // console.log("ELSE IF: ", item);
      if (isInGroup.length > 0) {
        // console.log("CATEGORY IF: ", item);
        let mailInfo;

        // ADD: CHECK FOR receiver !== user
        if (isInGroup[0][0].header.from[0].email === user) {
          // console.log("CATEGORY if: ", item);
          mailInfo = isInGroup[0][0].header.to[0].email;
        } else {
          // console.log("CATEGORY else: ", item);
          mailInfo = isInGroup[0][0].header.from[0].email;
        }

        if (!groups[mailInfo]) {
          // console.log(mailInfo, "CATEGORY if: ", item);
          groups[mailInfo] = [];
        }
        groups[mailInfo].push(item);
      } else {
        // console.log("CATEGORY ELSE: ", item);
        if (!groups[receiver]) {
          // console.log("CATEGORY ELSE-IF: ", item, receiver);
          groups[receiver] = [];
        }
        groups[receiver].push(item);
      }
    }
    // else if (groupFilterer.length > 0) {
    //   console.log("!hasGroup: ", item);
    //   // MAP THE hasGroup and create groups["subject name"]
    //   if(!hasGroup){
    //   groupFilterer.map((data) => {
    //     groups[data.header.subject[0]] = [];
    //     return groups[data.header.subject[0]].push(data);
    //   })}

    // }
    else {
      // console.log("ELSE: ", item);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    }

    return groups;
  }, {});

  // console.log("ITEM: ", sortData);

  // FETCH ALL THE CONVERSATIONS
  const conversations = async () => {
    try {
      // THIS IS ONLY FOR SINGLE PEER | CHECK IF IT IS FOR GROUP OR SINGLE
      const response = await fetch(
        "http://localhost:3001/conversation/retrieve",
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
      // console.log("CONVERSATION: ", data);
      dispatch(setRecipient(data));
    } catch (error) {
      // DO SOME ERROR ANIMATION!
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
    console.log("RESULT 1: ", result);
  }, []);

  useEffect(() => {
    socket.on("new email", (email) => {
      console.log("NEW EMAIL", email);

      const getSender = email.header.from[0].match(/<([^>]+)>/)?.[1];
      console.log("SENDER: ", getSender);
      // UPDATES THE CONTACT LIST
      setResult((prevState) => {
        if (prevState.hasOwnProperty(getSender)) {
          return {
            ...prevState,
            [getSender]: [...prevState[getSender], email],
          };
        } else {
          return {
            ...prevState,
            [getSender]: [email],
          };
        }
      });

      // Send or Push this new email to the redux state: email
      dispatch(addEmail(email));
    });
  }, [socket]);
  console.log("RESULT 2: ", result);

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
