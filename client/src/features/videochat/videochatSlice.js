import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callAccepted: false,
  callEnded: false,
  stream: null,
  call: {},
  myVideo: null,
  userVideo: null,
  connectionRef: null,
};

export const videochatSlice = createSlice({
  name: "videochat",
  initialState,
  reducers: {
    setCallAccepted: (state, action) => {
      state.callAccepted = action.payload;
    },
    setCallEnded: (state, action) => {
      state.callEnded = action.payload;
    },
    setStream: (state, action) => {
      state.stream = action.payload;
    },
    setCall: (state, action) => {
      state.call = action.payload;
    },
    setMyVideo: (state, action) => {
      state.myVideo = action.payload;
    },
    setUserVideo: (state, action) => {
      state.userVideo = action.payload;
    },
    setConnectionRef: (state, action) => {
      state.connectionRef = action.payload;
    },
    setVideoChatState: (state) => {
      state.callAccepted = false;
      state.callEnded = false;
      state.stream = null;
      state.call = {};
      state.myVideo = null;
      state.userVideo = null;
      state.connectionRef = null;
    },
  },
});

export const {
  setCallAccepted,
  setCallEnded,
  setStream,
  setCall,
  setMyVideo,
  setUserVideo,
  setConnectionRef,
  setVideoChatState,
} = videochatSlice.actions;

export default videochatSlice.reducer;
