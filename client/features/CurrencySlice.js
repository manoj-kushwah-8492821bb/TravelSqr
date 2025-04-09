import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currencyData: {
    id: 1,
    name: "United States Dollar",
    currency: "USD",
    symbol: "$",
    country: "United States",
    flag:"/img/general/01United-States.png",
    status:false
  },
};

export const CurrencySlice = createSlice({
  name: "Currency",
  initialState,
  reducers: {
    CurrencyChange: (state, { payload }) => {
      state.currencyData = payload;
    },
  },
});

export const { CurrencyChange } = CurrencySlice.actions;
export default CurrencySlice.reducer;
