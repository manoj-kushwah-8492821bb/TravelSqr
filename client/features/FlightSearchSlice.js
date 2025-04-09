import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  flightSearch: [],
  FlightStateData: {},
  FlightStateStatus: false,
};

export const FlightSearchSlice = createSlice({
  name: "Flight",
  initialState,
  reducers: {
    FlightSuccess: (state, { payload }) => {
      state.flightSearch = payload;
    },
    FlightState: (state, { payload }) => {
      state.FlightStateData = payload;
    },
    FlightStatus: (state, { payload }) => {
      state.FlightStateStatus = true;
    },
  },
});

export const { FlightSuccess, FlightState, FlightStatus } = FlightSearchSlice.actions;
export default FlightSearchSlice.reducer;
