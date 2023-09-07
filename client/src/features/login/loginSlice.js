import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userExist: true,
};

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    isUserExist: (state, action) => {
      state.userExist = action.payload;
    },
  },
});

export const { isUserExist } = loginSlice.actions;

export default loginSlice.reducer;
