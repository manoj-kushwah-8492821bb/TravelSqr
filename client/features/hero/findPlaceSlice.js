import { createSlice } from "@reduxjs/toolkit";
import { RiPlaneLine, RiHotelLine, RiCarLine } from "react-icons/ri";

const initialState = {
  tabs: [
    {
      id: 7,
      name: "Flights",
      icon: RiPlaneLine,
      bgImage: "/img/masthead/1/flight.png",
    },
    {
      id: 1,
      name: "Hotel",
      icon: RiHotelLine,
      bgImage:
        "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      name: "Cab",
      icon: RiCarLine,
      bgImage: "/img/masthead/1/cab.webp",
    },
  ],
  currentTab: "Flights",
};

export const findPlaceSlice = createSlice({
  name: "find-place",
  initialState,
  reducers: {
    addCurrentTab: (state, { payload }) => {
      state.currentTab = payload.name;
    },
  },
});

export const { addCurrentTab } = findPlaceSlice.actions;
export default findPlaceSlice.reducer;
