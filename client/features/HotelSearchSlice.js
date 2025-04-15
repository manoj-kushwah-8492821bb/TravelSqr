import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hotelSearch: [],
  HotelStateData: {},
  HotelStateStatus: false,
};

export const HotelSearchSlice = createSlice({
  name: "Hotel",
  initialState,
  reducers: {
    HotelSuccess: (state, { payload }) => {
      state.hotelSearch = payload;
    },
    HotelState: (state, { payload }) => {
      state.HotelStateData = payload;
    },
    HotelStatus: (state, { payload }) => {
      state.HotelStateStatus = true;
    },
  },
});

export const { HotelSuccess, HotelState, HotelStatus } =
  HotelSearchSlice.actions;
export default HotelSearchSlice.reducer;
