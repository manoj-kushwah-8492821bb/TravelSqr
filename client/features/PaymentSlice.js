import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentData: {},
};

export const PaymentSlice = createSlice({
  name: "Flight",
  initialState,
  reducers: {
    PaymentStart: (state, { payload }) => {
      state.paymentData = payload;
    },
  },
});

export const { PaymentStart } = PaymentSlice.actions;
export default PaymentSlice.reducer;
