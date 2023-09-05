import { FaRegStar } from "react-icons/fa";
import {
  BsCardText,
  BsCheckSquare,
  BsArchive,
  BsChevronDown,
} from "react-icons/bs";
import { MdOutlineWatchLater, MdOutlineScheduleSend } from "react-icons/md";
import { TfiPencil } from "react-icons/tfi";

export const infoList = [
  {
    name: "Starred",
    icon: <FaRegStar />,
  },
  {
    name: "Notes",
    icon: <BsCardText />,
  },
  {
    name: "Tasks",
    icon: <BsCheckSquare />,
  },
  {
    name: "Archived",
    icon: <BsArchive />,
  },
  {
    name: "Snoozed",
    icon: <MdOutlineWatchLater />,
  },
  {
    name: "Scheduled",
    icon: <MdOutlineScheduleSend />,
  },
  {
    name: "Draft",
    icon: <TfiPencil />,
  },
  {
    name: "Show Folders",
    icon: <BsChevronDown />,
  },
];

export const lowerList = [
  {
    name: "Add Account",
    icon: <FaRegStar />,
  },
  {
    name: "Settings",
    icon: <BsCardText />,
  },
  {
    name: "Upgrade Plan",
    icon: <BsCheckSquare />,
  },
  {
    name: "Help",
    icon: <BsArchive />,
  },
  {
    name: "Logout",
    icon: <MdOutlineWatchLater />,
  },
  {
    name: "Version C.L.O.N.E",
    icon: <MdOutlineScheduleSend />,
  },
];
