import React from "react";
import ContactInfo from "./Conversation/ContactInfo";
import MessageContent from "./Conversation/MessageContent";
import ReplyField from "./Conversation/ReplyField";

function Conversation() {
  return (
    <div className="Conversation">
      <ContactInfo />
      <div className="Message__Content">
        <MessageContent />
      </div>
      <ReplyField />
    </div>
  );
}

export default Conversation;
