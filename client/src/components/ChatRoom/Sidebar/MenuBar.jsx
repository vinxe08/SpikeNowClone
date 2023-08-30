import React from "react";
import { FaComment } from "react-icons/fa";
import { BsClock } from "react-icons/bs";
import { HiPencil, HiUserGroup } from "react-icons/hi";
import { GrGroup } from "react-icons/gr";
import { IoMdContact } from "react-icons/io";
import "./MenuBar.css";
import { useDispatch } from "react-redux";
import { setMenu } from "../../../features/navigate/menuSlice";

function MenuBar() {
  const dispatch = useDispatch();

  return (
    <div className="MenuBar">
      <div className="menu__icon" onClick={() => dispatch(setMenu("Home"))}>
        <FaComment />
      </div>
      <div className="menu__icon">
        <BsClock />
      </div>
      <div className="new__message">
        <HiPencil />
      </div>
      <div className="menu__icon" onClick={() => dispatch(setMenu("Group"))}>
        <HiUserGroup />
      </div>
      <div className="menu__icon">
        <IoMdContact />
      </div>
    </div>
  );
}

export default MenuBar;
