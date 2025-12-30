import { createSlice } from "@reduxjs/toolkit";



const initialState = {
  mode: (localStorage.getItem("theme")) || "system",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme(state) {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = newMode;
      localStorage.setItem("theme", newMode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
