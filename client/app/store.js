import { configureStore } from "@reduxjs/toolkit";
import findPlaceSlice from "../features/hero/findPlaceSlice";
import LoginAuthSlice from "../features/LoginAuthSlice";
import FlightSearchSlice from "../features/FlightSearchSlice";
import HotelSearchSlice from "../features/HotelSearchSlice";
import SidebarSlice from "../features/SidebarSlice";
import PaymentSlice from "../features/PaymentSlice";
import CurrencySlice from "../features/CurrencySlice";
import MaxPriceSlice from "../features/MaxPriceSlice";
import GuestUserSlice from "../features/GuestUserSlice";

export const store = configureStore({
  reducer: {
    hero: findPlaceSlice,
    userAuth: LoginAuthSlice,
    flightSearch: FlightSearchSlice,
    hotelSearch: HotelSearchSlice,
    SidebarData: SidebarSlice,
    PaymentSlice: PaymentSlice,
    CurrencySlice: CurrencySlice,
    MaxPriceSlice: MaxPriceSlice,
    GuestUserSlice: GuestUserSlice,
    //FlightStateData: FlightSearchSlice,
  },
});
