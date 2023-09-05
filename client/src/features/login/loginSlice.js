import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

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
