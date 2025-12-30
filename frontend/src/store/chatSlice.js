import { createSlice } from '@reduxjs/toolkit';
import { MOCK_CHAT_HISTORY } from '@/constants/mockData';

const initialState = {
    history: MOCK_CHAT_HISTORY,
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
    },
});

export const { addMessage, setLoading, clearCurrentChat } = chatSlice.actions;
export default chatSlice.reducer;
