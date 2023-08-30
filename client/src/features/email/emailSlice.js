import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: [],
  user: null,
  recipients: null,
  allEmail: [],
  groupEmail: [],
  toggle: false,
  receiver: null,
};

export const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    getAllEmail: (state, action) => {
      // console.log("PAYLOAD: ", action.payload);
      const modifyEmail = (emailHeader) => {
        const from = emailHeader.header.from;
        const to = emailHeader.header.to;

        const pattern = /(.+?)\s<(.+?)>/;
        const resultFrom = pattern.exec(emailHeader.header.from[0]);
        const resultTo = pattern.exec(emailHeader.header.to[0]);

        if (resultFrom) {
          const nameFrom = resultFrom[1].trim().replace(/^"(.+)"$/, "$1");
          const emailFrom = resultFrom[2];

          const outputFrom = { name: nameFrom, email: emailFrom };

          from.splice(0, 1, outputFrom);
        } else {
          // console.log("ELSE FROM: ", emailHeader);
          from.splice(0, 1, { email: from[0] });
        }

        if (resultTo) {
          const nameTo = resultTo[1].trim().replace(/^"(.+)"$/, "$1");
          const emailTo = resultTo[2];

          const outputTo = { name: nameTo, email: emailTo };
          to.splice(0, 1, outputTo);
          // console.log(output); // PUT THIS IN email.header.from[0]

          return emailHeader;
        } else {
          // console.log("ELSE TO: ", emailHeader);
          to.splice(0, 1, { email: to[0] });
          return emailHeader;
        }
      };
      const emails = action.payload.inbox
        ?.filter((obj) => obj.body !== undefined)
        .map((emailHeader) => {
          return modifyEmail(emailHeader);
        });

      const sentBox = action.payload.sent
        ?.filter((obj) => obj.body !== undefined)
        .map((emailHeader) => {
          return modifyEmail(emailHeader);
        });

      // console.log("EMAIL: ", emails, sentBox);
      state.allEmail = [...emails, ...sentBox];
      // state.allEmail = { email: emails, sent: sentBox };
    },
    // for selected email
    getEmail: (state, action) => {
      state.email = action.payload;
    },
    addEmail: (state, action) => {
      state.email.push(action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRecipient: (state, action) => {
      state.recipients = action.payload;
    },
    setGroupEmail: (state, action) => {
      state.groupEmail = action.payload;
    },
    setToggle: (state, action) => {
      state.toggle = action.payload;
    },
    setReciever: (state, action) => {
      state.receiver = action.payload;
    },
  },
});

export const {
  getAllEmail,
  getEmail,
  addEmail,
  setUser,
  setRecipient,
  setGroupEmail,
  setToggle,
  setReciever,
} = emailSlice.actions;

export default emailSlice.reducer;
