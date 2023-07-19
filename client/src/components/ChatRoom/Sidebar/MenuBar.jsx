import React from "react";
import { FaComment } from "react-icons/fa";
import { BsClock } from "react-icons/bs";
import { HiPencil } from "react-icons/hi";
import { GrGroup } from "react-icons/gr";
import { IoMdContact } from "react-icons/io";
import "./MenuBar.css";

function MenuBar() {
  return (
    <div className="MenuBar">
      <FaComment />
      <BsClock />
      <div className="new__message">
        <HiPencil />
      </div>
      <GrGroup />
      <IoMdContact />
    </div>
  );
}

export default MenuBar;
