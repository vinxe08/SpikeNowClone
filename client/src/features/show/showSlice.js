import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  active: false,
  caller: null,
  isCalling: false,
  type: "",
  call: null,
  inComingCall: false,
  onCall: false,
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
    setType: (state, action) => {
      state.type = action.payload;
    },
    setCall: (state, action) => {
      state.call = action.payload;
    },
    setInComingCall: (state, action) => {
      state.inComingCall = action.payload;
    },
    setOnCall: (state, action) => {
      state.onCall = action.payload;
    },
  },
});

export const {
  showContactInfo,
  hideContactInfo,
  setCaller,
  setIsCalling,
  setType,
  setCall,
  setInComingCall,
  setOnCall,
} = showSlice.actions;

export default showSlice.reducer;
