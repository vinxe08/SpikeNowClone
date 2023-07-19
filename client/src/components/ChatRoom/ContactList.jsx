import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FadeLoader from "react-spinners/FadeLoader";
import { setRecipient } from "../../features/email/emailSlice";
import MessageList from "./Sidebar/MessageList";

function ContactList() {
  const email = useSelector((state) => state.emailReducer);
  const dispatch = useDispatch();
  // console.log("ContactList: ", email);

  // Groups all email according to email address
  const groupedData = email.allEmail.reduce((groups, item) => {
    const category = item?.header?.from[0]?.email;

    // Check if the category already exists as a key in the groups object
    if (!groups[category]) {
      // If the category does not exist, create a new array for it
      groups[category] = [];
    }

    // Push the item into the corresponding category array
    groups[category].push(item);

    // console.log("GroupData: ", groups);
    return groups;
  }, {});

  // FETCH ALL THE CONVERSATIONS
  const conversations = async () => {
    // console.log("Conversation: ", email.user.email);
    try {
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
      dispatch(setRecipient(data));
    } catch (error) {
      // console.log("ContactList: Error: ", error);
    }
  };

  useEffect(() => {
    conversations();
  }, []);

  return (
    // FOR MICROSOFT GRAPH API
    // <>
    //   <div className="Message__List">
    //     {
    //       emails?.length > 0 ? (
    //         <div>
    //           <h1 className="chatroom__today">Today</h1>
    //           {emails
    //             ?.filter(
    //               (data) =>
    //                 data[0]?.toRecipients[0]?.emailAddress ||
    //                 data[0]?.from?.emailAddress
    //             )
    //             .map((mail) => (
    //               <MessageList
    //                 key={mail[0].conversationId}
    //                 user={client}
    //                 recipient={mail}
    //               />
    //             ))}
    //         </div>
    //       ) :
    //       <div className="loading__icon">
    //         <FadeLoader
    //           color="#1E90FF"
    //           loading={true}
    //           size={100}
    //           aria-label="Loading Spinner"
    //           data-testid="loader"
    //         />
    //       </div>
    //     }
    //   </div>
    // </>
    // END: FOR MICROSOFT GRAPH API

    <>
      <div className="Message__List">
        {email.allEmail?.length > 0 ? (
          <div>
            <h1 className="chatroom__today">Today</h1>
            {Object.values(groupedData).map((mail, index) => (
              <MessageList key={index} email={mail} />
            ))}
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
