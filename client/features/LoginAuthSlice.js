import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: {
    token: "",
  },
};

export const LoginAuthSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    LoginSuccess: (state, { payload }) => {
      state.userDetails.token = payload;
    }
  },
});

export const { LoginSuccess } = LoginAuthSlice.actions;
export default LoginAuthSlice.reducer;
