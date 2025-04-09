import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  route: {},
};

export const GuestUserSlice = createSlice({
  name: "Route",
  initialState,
  reducers: {
    RouteChange: (state, { payload }) => {
      state.route = payload;
    },
  },
});

export const { RouteChange } = GuestUserSlice.actions;
export default GuestUserSlice.reducer;
