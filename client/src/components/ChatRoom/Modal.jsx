import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setModal } from "../../features/navigate/menuSlice";
import "./Modal.css";
import { IoIosArrowDown } from "react-icons/io";
import { FaLocationArrow } from "react-icons/fa";
import CreatableSelect from "react-select/creatable";
import { pushGroupEmail } from "../../features/email/emailSlice";
import { useOutletContext } from "react-router-dom";
import { Toast } from "../../lib/sweetalert";

function Modal() {
  const dispatch = useDispatch();
  const { socket } = useOutletContext();
  const [groupInfo, setGroupInfo] = useState({
    groupName: "",
    description: "",
  });
  const [value, setValue] = useState(null);
  const [options, setOptions] = useState(null);
  const user = useSelector((state) => state.emailReducer.user);
  const [error, setError] = useState("");
  const date = new Date();

  const filterContacts = (arrayContacts) => {
    const contacts = arrayContacts.map((contact) => ({
      value: contact.users.filter((data) => data !== user.email)[0],
      label: contact.users.filter((data) => data !== user.email)[0],
    }));

    setOptions(contacts);
  };

  function formatDateToCustomString(date) {
    const formatter = new Intl.DateTimeFormat("en", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });

    return formatter.format(date);
  }

  function getRandomString() {
    const strings = [
      "green__bg",
      "pink__bg",
      "yellow__bg",
      "voilet__bg",
      "darkblue__bg",
    ];

    const randomIndex = Math.floor(Math.random() * strings.length);
    return strings[randomIndex];
  }

  // Checks all the user that has conversation and make as a contact.
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_CONVERSATION_GET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.email,
          }),
        }
      );
      const data = await response.json();
      filterContacts(data);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
    }
  };

  // Check before create a group.
  const createGroup = async (e) => {
    const background = `${getRandomString()}`;
    // add ALERT
    if (groupInfo.groupName === "") {
      setError("Group Name is required");
      return;
    }
    if (!value) {
      setError("Please select users.");
      return;
    }

    e.preventDefault();
    const filteredValue = value.map((data) => data.value);
    filteredValue.push(user.email);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${process.env.REACT_APP_GROUP_CREATE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            users: filteredValue,
            groupName: groupInfo.groupName,
            description: groupInfo.description,
            background,
            timestamp: formatDateToCustomString(date),
          }),
        }
      );
      const data = await response.json();

      // Close modal & push this details
      if (data) {
        dispatch(setModal(false));
        dispatch(
          pushGroupEmail({
            users: filteredValue,
            groupName: groupInfo.groupName,
            description: groupInfo.description,
            background,
            timestamp: formatDateToCustomString(date),
            _id: data.response.group._id,
          })
        );

        // -------- SOCKET FOR REAL TIME ADD GROUP ----------
        socket.emit("group created", {
          users: filteredValue,
          groupName: groupInfo.groupName,
          description: groupInfo.description,
          background,
          timestamp: formatDateToCustomString(date),
          _id: data.response.group._id,
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Error. Try Again Later",
      });
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="group__modal">
      <div className="group__modalContainer">
        <div className="group__modalHeader">
          <div
            onClick={() => dispatch(setModal(false))}
            className="group__closeIcon"
          >
            <IoMdClose />
          </div>
          <div className="group__details">
            <h1 className="group__headerTitle">Create Group</h1>
            <div className="group__emailDetails">
              <h1 className="grou__userEmail">{user.email}</h1>
              <IoIosArrowDown />
            </div>
          </div>
        </div>

        {error && <h1 className="modal__error">{error}</h1>}
        <div className="group__form">
          <div className="group__icon icon__white pink__bg">
            <IoHome />
          </div>
          <div className="group__formfield">
            <input
              className="group__name"
              type="text"
              placeholder="Group Name"
              value={groupInfo.groupName}
              onChange={(e) =>
                setGroupInfo({
                  ...groupInfo,
                  groupName: e.target.value,
                })
              }
            />
            <input
              className="group__description"
              type="text"
              placeholder="Description (optional)"
              value={groupInfo.description}
              onChange={(e) =>
                setGroupInfo({
                  ...groupInfo,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="group__inviteRow">
          {/* REACT-SELECT */}
          {options ? (
            <CreatableSelect
              options={options}
              defaultValue={value}
              defaultMenuIsOpen
              placeholder="Select user"
              onChange={setValue}
              isMulti
              isSearchable
              styles={{
                multiValueRemove: (baseStyles, state) => ({
                  ...baseStyles,
                  color: state.isFocused ? "red" : "gray",
                  backgroundColor: state.isFocused ? "black" : "lightgreen",
                }),
              }}
            />
          ) : null}
        </div>
        <div className="group__button">
          <button
            // disabled={groupInfo.groupName === "" && !value}
            onClick={createGroup}
            className="arrow__button"
          >
            <FaLocationArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
