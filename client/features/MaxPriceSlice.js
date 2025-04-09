import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  max: {
    price: 100000,
    apiMax: 0
  },
};

export const MaxPriceSlice = createSlice({
  name: "Maxprice",
  initialState,
  reducers: {
    PriceChange: (state, { payload }) => {
      state.max.price = payload;
    },
    ApiPriceChange: (state, { payload }) => {
      state.max.apiMax = payload;
    },
  },
});

export const { PriceChange, ApiPriceChange } = MaxPriceSlice.actions;
export default MaxPriceSlice.reducer;
