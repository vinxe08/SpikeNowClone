import React from "react";
import ContactInfo from "../Conversation/ContactInfo";
import MessageContent from "../Conversation/MessageContent";
import ReplyField from "../Conversation/ReplyField";
import GroupContent from "./GroupContent";
import ReplyGroup from "./ReplyGroup";

function GroupConversation() {
  return (
    <div className="Conversation">
      <ContactInfo />
      <div className="Message__Content">
        {/* <GroupContent /> */}
        <MessageContent />
      </div>
      {/* <ReplyGroup /> */}
      <ReplyField />
    </div>
  );
}

export default GroupConversation;
