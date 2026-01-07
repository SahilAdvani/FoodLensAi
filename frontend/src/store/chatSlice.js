import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    history: [],
    currentChat: [],
    isLoading: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.currentChat.push(action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        clearCurrentChat: (state) => {
            state.currentChat = [];
        },
        setHistory: (state, action) => {
            state.history = action.payload;
        }
    },
});

export const { addMessage, setLoading, clearCurrentChat, setHistory } = chatSlice.actions;
export default chatSlice.reducer;
