import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatAPI } from '../utils/api';
import { getSocket } from '../utils/socket';
import {
  setConversations,
  setActiveUserId,
  setActiveMessages,
  addMessage,
  setTypingStatus,
  clearChat,
  setLoading
} from '../redux/chatSlice';
import { Send, MessageSquare, Clock, ArrowLeft, User, ShieldAlert } from 'lucide-react';

export default function ChatPortal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const { user } = useSelector((state) => state.auth || {});
  const { conversations, activeMessages, activeUserId, isTyping, isLoading } = useSelector((state) => state.chat || {});
  
  const [messageInput, setMessageInput] = useState('');
  const [activeUserDetail, setActiveUserDetail] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of chat history when messages or typing status updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  // Initial load: fetch conversations
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversationsList();

    return () => {
      dispatch(clearChat());
    };
  }, [user]);

  // Handle selected user changes: fetch message history and mark thread as read
  useEffect(() => {
    if (activeUserId) {
      fetchMessageHistory(activeUserId);
      markConversationAsRead(activeUserId);
      
      // Look up user details in current conversations list
      const selectedThread = conversations.find(c => c.otherUser.id === activeUserId);
      if (selectedThread) {
        setActiveUserDetail(selectedThread.otherUser);
      } else {
        // If not found in conversation history, user is a new chat started via URL query
        fetchTargetUserProfile(activeUserId);
      }
    } else {
      setActiveUserDetail(null);
      dispatch(setActiveMessages([]));
    }
  }, [activeUserId, conversations]);

  // Query parameter link helper (e.g. user clicked "Chat" button from inquiry dashboard)
  useEffect(() => {
    if (targetUserId && user) {
      if (targetUserId !== (user.id || user._id)) {
        dispatch(setActiveUserId(targetUserId));
      }
    }
  }, [targetUserId, user]);

  const fetchConversationsList = async () => {
    dispatch(setLoading(true));
    try {
      const res = await chatAPI.getConversations();
      dispatch(setConversations(res.data.conversations));
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchMessageHistory = async (otherId) => {
    try {
      const res = await chatAPI.getMessages(otherId);
      dispatch(setActiveMessages(res.data.messages));
    } catch (err) {
      console.error('Failed to load message history:', err.message);
    }
  };

  const markConversationAsRead = async (otherId) => {
    try {
      await chatAPI.markAsRead(otherId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err.message);
    }
  };

  const fetchTargetUserProfile = async (otherId) => {
    try {
      // Find details from api /auth/me or direct route, or just fall back to template loading
      // For this project, we can fetch active coordinator info from the conversations lists,
      // or if initiating a new thread, we fetch basic info.
      // We will search if there is a way to get user details:
      const res = await chatAPI.getConversations();
      const updatedList = res.data.conversations;
      const found = updatedList.find(c => c.otherUser.id === otherId);
      if (found) {
        setActiveUserDetail(found.otherUser);
      } else {
        // Fallback placeholder user template
        setActiveUserDetail({
          id: otherId,
          name: 'Coordinator / Couple',
          role: user?.role === 'organizer' ? 'couple' : 'organizer'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Text inputs key change listener: sends typing status updates via sockets
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    const socket = getSocket();
    const myId = user?.id || user?._id;
    if (socket && activeUserId && myId) {
      socket.emit('chat:typing', {
        sender: myId,
        receiver: activeUserId,
        isTyping: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing', {
          sender: myId,
          receiver: activeUserId,
          isTyping: false
        });
      }, 2000);
    }
  };

  // Socket message emitter: sends a message in real-time
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeUserId || !user) return;

    const myId = user.id || user._id;
    const socket = getSocket();
    const textToSend = messageInput.trim();
    setMessageInput('');

    // Clear typing indicator status instantly
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) {
      socket.emit('chat:typing', {
        sender: myId,
        receiver: activeUserId,
        isTyping: false
      });
    }

    if (socket && socket.connected) {
      // Emit via WebSockets for real-time delivery
      socket.emit('chat:send', {
        sender: myId,
        receiver: activeUserId,
        text: textToSend
      });
    } else {
      // Fallback: POST request if WebSocket is disconnected
      try {
        const res = await chatAPI.sendMessage({
          receiver: activeUserId,
          text: textToSend
        });
        dispatch(addMessage(res.data.message));
        fetchConversationsList();
      } catch (err) {
        console.error('Failed to send fallback message:', err.message);
      }
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleLabel = (role) => {
    if (role === 'organizer') return 'Coordinator';
    if (role === 'admin') return 'Admin';
    return 'Couple';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-[var(--text-body)] h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 shrink-0 flex items-center gap-3">
        <button
          onClick={() => navigate('/my-inquiries')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#cf5577] hover:text-[#e86f8f]"
        >
          <ArrowLeft size={16} />
          Inquiries
        </button>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-sm font-bold text-[var(--text-dark)] uppercase tracking-wider">Messaging Portal</span>
      </div>

      <div className="flex-1 flex gap-6 clay-card overflow-hidden h-full min-h-[450px]">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full lg:w-1/3 border-r border-[var(--border-light)] flex flex-col h-full ${
            activeUserId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-[var(--border-light)] bg-[var(--clay-inset-bg)] shrink-0">
            <h2 className="font-bold text-lg text-[var(--text-dark)] flex items-center gap-2">
              <MessageSquare size={18} className="text-[#cf5577]" />
              Conversations
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-light)]">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#cf5577]" />
              </div>
            )}

            {!isLoading && conversations.length === 0 && (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                No active conversations yet.
              </div>
            )}

            {!isLoading &&
              conversations.map((conv) => {
                const isSelected = activeUserId === conv.otherUser.id;
                return (
                  <button
                    key={conv.otherUser.id}
                    onClick={() => dispatch(setActiveUserId(conv.otherUser.id))}
                    className={`w-full text-left p-4 flex gap-3 transition ${
                      isSelected ? 'bg-[#ffd8c7]/20 border-l-4 border-[#e86f8f]' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-[#ffd8c7] flex items-center justify-center text-[#9f3f61] font-bold shrink-0 shadow-inner">
                      {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-sm text-[var(--text-dark)] truncate capitalize">
                          {conv.otherUser.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-[var(--text-muted)] truncate flex-1 pr-2">
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#e86f8f] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="mt-1 inline-block text-[9px] font-bold tracking-wider uppercase text-[#cf5577] bg-[#ffd8c7]/30 px-2 py-0.5 rounded-full">
                        {getRoleLabel(conv.otherUser.role)}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Column: Chat Window Message Pane */}
        <div
          className={`w-full lg:w-2/3 flex flex-col h-full bg-white/5 dark:bg-black/5 ${
            !activeUserId ? 'hidden lg:flex justify-center items-center p-8' : 'flex'
          }`}
        >
          {activeUserId && activeUserDetail ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-light)] bg-[var(--clay-inset-bg)] shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch(setActiveUserId(null))}
                    className="lg:hidden text-[var(--text-muted)] hover:text-[#cf5577]"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-[#ffd8c7] flex items-center justify-center text-[#9f3f61] font-bold shadow-inner">
                    {activeUserDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-dark)] capitalize leading-tight">
                      {activeUserDetail.name}
                    </h3>
                    <span className="text-[10px] text-[#cf5577] font-semibold uppercase tracking-wider">
                      {getRoleLabel(activeUserDetail.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeMessages.map((msg) => {
                  const isSentByMe = msg.sender === (user.id || user._id);
                  return (
                    <div
                      key={msg.id || msg._id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm border ${
                          isSentByMe
                            ? 'bg-gradient-to-r from-[#e86f8f] to-[#cf5577] text-white border-[#cf5577]/20 rounded-tr-none'
                            : 'bg-[var(--clay-card-bg)] text-[var(--text-body)] border-[var(--clay-card-border)] rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <span
                          className={`block text-[9px] text-right mt-1.5 font-medium ${
                            isSentByMe ? 'text-white/70' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Real-time Typing Bubble indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--clay-card-bg)] border border-[var(--clay-card-border)] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs text-[var(--text-muted)] italic mr-1">
                        {activeUserDetail.name} is typing
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cf5577] animate-bounce delay-0"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cf5577] animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cf5577] animate-bounce delay-300"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer Form bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-[var(--border-light)] bg-[var(--clay-inset-bg)] shrink-0 flex gap-3 items-center"
              >
                <div className="flex-1 clay-inset px-4 py-2.5">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    className="w-full bg-transparent text-sm text-[var(--text-body)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="h-10 w-10 rounded-full bg-[#e86f8f] hover:bg-[#cf5577] text-white flex items-center justify-center transition shadow-md disabled:opacity-50 disabled:hover:bg-[#e86f8f] shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8">
              <MessageSquare size={48} className="mx-auto mb-4 text-[#cf5577] opacity-60" />
              <h3 className="text-xl font-bold text-[var(--text-dark)]">Your Messages</h3>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Select a conversation from the sidebar, or contact a venue coordinator directly from your inquiries dashboard to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline svg icons helper for ChevronLeft
function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
  );
}
