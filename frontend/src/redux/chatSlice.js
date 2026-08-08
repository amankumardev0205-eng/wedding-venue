import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  activeMessages: [],
  activeUserId: null,
  unreadCount: 0,
  isTyping: false,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.unreadCount = action.payload.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    },
    setActiveUserId: (state, action) => {
      state.activeUserId = action.payload;
      // Mark local conversation as read
      const conv = state.conversations.find(c => c.otherUser.id === action.payload);
      if (conv) {
        state.unreadCount = Math.max(0, state.unreadCount - conv.unreadCount);
        conv.unreadCount = 0;
      }
    },
    setActiveMessages: (state, action) => {
      state.activeMessages = action.payload;
    },
    addMessage: (state, action) => {
      const msg = action.payload;
      const otherId = state.activeUserId;
      
      // If message belongs to active chat thread, push it to activeMessages list
      if (otherId && (msg.sender === otherId || msg.receiver === otherId)) {
        if (!state.activeMessages.some(m => (m.id || m._id) === (msg.id || msg._id))) {
          state.activeMessages.push(msg);
        }
      }

      // Find which user we are conversing with in this message
      const talkerId = msg.sender === otherId ? msg.sender : (msg.sender === state.activeUserId ? msg.receiver : msg.sender);
      const index = state.conversations.findIndex(c => c.otherUser.id === talkerId);
      
      if (index !== -1) {
        state.conversations[index].lastMessage = msg;
        if (msg.sender === talkerId && state.activeUserId !== talkerId) {
          state.conversations[index].unreadCount += 1;
          state.unreadCount += 1;
        }
        // Move conversation to the top of the list
        const [conv] = state.conversations.splice(index, 1);
        state.conversations.unshift(conv);
      }
    },
    setTypingStatus: (state, action) => {
      const { sender, isTyping } = action.payload;
      if (state.activeUserId === sender) {
        state.isTyping = isTyping;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.activeMessages = [];
      state.activeUserId = null;
      state.isTyping = false;
    }
  }
});

export const {
  setConversations,
  setActiveUserId,
  setActiveMessages,
  addMessage,
  setTypingStatus,
  setLoading,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
