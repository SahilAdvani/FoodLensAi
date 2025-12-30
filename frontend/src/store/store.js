import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import languageReducer from "./languageSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    language: languageReducer,
    chat: chatReducer,
  },
});
