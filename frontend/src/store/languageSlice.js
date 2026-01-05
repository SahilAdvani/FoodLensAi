import { createSlice } from '@reduxjs/toolkit';

const savedLanguage = localStorage.getItem('language');

const initialState = {
    currentLanguage: savedLanguage || 'en-IN', // 'en-IN' or 'hi-IN'
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.currentLanguage = action.payload;
            localStorage.setItem('language', action.payload);
        },
        toggleLanguage: (state) => {
            const nextLang = state.currentLanguage === 'en-IN' ? 'hi-IN' : 'en-IN';
            state.currentLanguage = nextLang;
            localStorage.setItem('language', nextLang);
        },
    },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
