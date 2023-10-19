import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: [],
  user: null,
  recipients: null,
  allEmail: [],
  groupEmail: [],
  toggle: false,
  receiver: null,
  mailNotification: [],
};

export const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    getAllEmail: (state, action) => {
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
          from.splice(0, 1, { email: from[0] });
        }

        if (resultTo) {
          const nameTo = resultTo[1].trim().replace(/^"(.+)"$/, "$1");
          const emailTo = resultTo[2];

          const outputTo = { name: nameTo, email: emailTo };
          to.splice(0, 1, outputTo);

          return emailHeader;
        } else {
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

      state.allEmail = [...emails, ...sentBox];
    },
    addAllEmail: (state, action) => {
      state.allEmail.push(action.payload);
    },
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
    pushGroupEmail: (state, action) => {
      state.groupEmail.push(action.payload);
    },
    setToggle: (state, action) => {
      state.toggle = action.payload;
    },
    setReciever: (state, action) => {
      state.receiver = action.payload;
    },
    pushNotification: (state, action) => {
      if (!Array.isArray(state.mailNotification)) {
        state.mailNotification = [];
      }

      if (!state.mailNotification.includes(action.payload)) {
        state.mailNotification.push(action.payload);
      }
    },
    removeNotification: (state, action) => {
      if (
        Array.isArray(state.mailNotification) &&
        state.mailNotification.find(
          (notif) =>
            notif.name === action.payload.name &&
            notif.type === action.payload.type
        )
      ) {
        state.mailNotification.splice(
          state.mailNotification.findIndex(
            (notif) =>
              notif.name === action.payload.name &&
              notif.type === action.payload.type
          ),
          1
        );
      }
    },
  },
});

export const {
  getAllEmail,
  addAllEmail,
  getEmail,
  addEmail,
  setUser,
  setRecipient,
  setGroupEmail,
  setToggle,
  setReciever,
  pushGroupEmail,
  pushNotification,
  removeNotification,
} = emailSlice.actions;

export default emailSlice.reducer;
