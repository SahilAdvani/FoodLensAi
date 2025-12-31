import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
};

const loaderSlice = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        showLoader: (state) => {
            state.isLoading = true;
        },
        hideLoader: (state) => {
            state.isLoading = false;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const { showLoader, hideLoader, setLoading } = loaderSlice.actions;
export default loaderSlice.reducer;
