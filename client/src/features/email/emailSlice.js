import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: [],
  user: null,
  recipients: null,
  allEmail: [],
};

export const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    getAllEmail: (state, action) => {
      const emails = action.payload
        ?.filter((obj) => obj.body !== undefined)
        .map((emailHeader) => {
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
          }

          if (resultTo) {
            const nameTo = resultTo[1].trim().replace(/^"(.+)"$/, "$1");
            const emailTo = resultTo[2];

            const outputTo = { name: nameTo, email: emailTo };
            to.splice(0, 1, outputTo);
            // console.log(output); // PUT THIS IN email.header.from[0]

            return emailHeader;
          } else {
            return emailHeader;
          }
        });

      state.allEmail = emails;
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
  },
});

export const { getAllEmail, getEmail, addEmail, setUser, setRecipient } =
  emailSlice.actions;

export default emailSlice.reducer;
