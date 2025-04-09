import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stop: [],
  cabin: [],
  price: [],
  airlines: {},
};

export const SidebarSlice = createSlice({
  name: "Sidebar",
  initialState,
  reducers: {
    AddAirlines: (state, action) => {
      state.airlines=action.payload;
    },
    RemoveAirlines: (state, action) => {
      state.airlines='';
    },
  },
});

export const { AddAirlines, RemoveAirlines } = SidebarSlice.actions;
export default SidebarSlice.reducer;
