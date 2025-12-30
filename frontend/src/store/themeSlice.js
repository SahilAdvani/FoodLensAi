import { createSlice } from "@reduxjs/toolkit";



const initialState = {
  mode: (localStorage.getItem("theme") ) || "system",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
