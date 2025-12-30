import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLanguage: 'en-IN', // 'en-IN' or 'hi-IN'
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.currentLanguage = action.payload;
        },
        toggleLanguage: (state) => {
            state.currentLanguage = state.currentLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
        },
    },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
