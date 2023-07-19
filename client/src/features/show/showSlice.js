import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  active: false,
  caller: null,
  isCalling: false,
};

export const showSlice = createSlice({
  name: "active",
  initialState,
  reducers: {
    showContactInfo: (state) => {
      state.active = true;
    },
    hideContactInfo: (state) => {
      state.active = false;
    },
    setCaller: (state, action) => {
      state.caller = action.payload;
    },
    setIsCalling: (state, action) => {
      state.isCalling = action.payload;
    },
  },
});

export const { showContactInfo, hideContactInfo, setCaller, setIsCalling } =
  showSlice.actions;

export default showSlice.reducer;
