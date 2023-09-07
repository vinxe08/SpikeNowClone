import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stream: null,
  tracks: [],
};

export const mediaStream = createSlice({
  name: "mediaStream",
  initialState: { stream: null, tracks: [] },
  reducers: {
    setMediaStream: (state, action) => {
      const { stream } = action.payload;
      return { stream, tracks: stream.getTracks() };
    },
    stopMediaStream: (state) => {
      const { tracks, stream } = state;
      console.log("STREAM: ", state.stream);
      if (state.stream && state.tracks.length > 0) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
      return { stream: null, tracks: [] };
    },
  },
});

export const { setMediaStream, stopMediaStream } = mediaStream.actions;

export default mediaStream.reducer;
