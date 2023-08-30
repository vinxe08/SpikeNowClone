import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  menu: "Home",
  modalCreate: false,
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu: (state, action) => {
      state.menu = action.payload;
    },
    setModal: (state, action) => {
      state.modalCreate = action.payload;
    },
  },
});

export const { setMenu, setModal } = menuSlice.actions;

export default menuSlice.reducer;
