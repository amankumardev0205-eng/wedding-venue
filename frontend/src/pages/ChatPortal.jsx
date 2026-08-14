import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Clock, ArrowLeft, ChevronLeft } from 'lucide-react';

import { chatAPI } from '../utils/api';
import { getSocket } from '../utils/socket';
import {
  setConversations,
  setActiveUserId,
  setActiveMessages,
  addMessage,
  clearChat,
  setLoading
} from '../redux/chatSlice';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

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
    <div className="mx-auto max-w-7xl px-6 py-8 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Breadcrumb Header */}
      <div className="mb-6 shrink-0 flex items-center gap-3 select-none">
        <Button
          onClick={() => navigate('/my-inquiries')}
          variant="ghost"
          size="sm"
          className="px-3 py-1.5 text-primary hover:bg-primary/5 gap-1.5 font-bold"
          leftIcon={<ArrowLeft size={15} />}
        >
          Inquiries
        </Button>
        <span className="text-stone-300 dark:text-stone-750">/</span>
        <span className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider">
          Messaging Portal
        </span>
      </div>

      {/* Main Dual Pane layout Card */}
      <Card className="flex-1 flex gap-0 border border-[var(--border-medium)] overflow-hidden h-full min-h-[450px] shadow-sm bg-white dark:bg-stone-900/10">
        
        {/* Left Column: Conversations List sidebar */}
        <div
          className={`w-full lg:w-1/3 border-r border-[var(--border-light)] flex flex-col h-full bg-stone-50/40 dark:bg-stone-900/30 ${
            activeUserId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-5 border-b border-[var(--border-light)] bg-white dark:bg-stone-900/40 shrink-0 select-none">
            <h2 className="font-serif text-lg font-bold text-[var(--text-dark)] flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              <span>Conversations</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-light)]">
            {isLoading && (
              <div className="flex items-center justify-center py-12 select-none">
                <div className="h-8 w-8 rounded-full border-2 border-primary/15 border-t-primary animate-spin" />
              </div>
            )}

            {!isLoading && conversations.length === 0 && (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider select-none">
                No active messages yet.
              </div>
            )}

            {!isLoading &&
              conversations.map((conv) => {
                const isSelected = activeUserId === conv.otherUser.id;
                return (
                  <button
                    key={conv.otherUser.id}
                    onClick={() => dispatch(setActiveUserId(conv.otherUser.id))}
                    className={`w-full text-left p-4 flex gap-3 transition-all duration-150 border-l-4 outline-none ${
                      isSelected 
                        ? 'bg-primary/5 dark:bg-primary/10 border-l-primary' 
                        : 'hover:bg-stone-50 dark:hover:bg-stone-850/20 border-l-transparent'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 shadow-inner select-none">
                      {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-serif font-bold text-sm text-[var(--text-dark)] truncate capitalize">
                          {conv.otherUser.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-semibold flex items-center gap-1 select-none">
                          <Clock size={10} className="shrink-0" />
                          <span>{formatTime(conv.lastMessage?.createdAt)}</span>
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-xs text-[var(--text-muted)] font-semibold truncate flex-1 pr-2">
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shadow-sm shrink-0 select-none">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2 capitalize select-none">
                        {getRoleLabel(conv.otherUser.role)}
                      </Badge>
                      
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Column: Chat Window Pane */}
        <div
          className={`w-full lg:w-2/3 flex flex-col h-full bg-stone-50/20 dark:bg-stone-900/10 ${
            !activeUserId ? 'hidden lg:flex justify-center items-center p-8' : 'flex'
          }`}
        >
          {activeUserId && activeUserDetail ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-[var(--border-light)] bg-white dark:bg-stone-900/40 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch(setActiveUserId(null))}
                    className="lg:hidden text-[var(--text-muted)] hover:text-primary p-1 bg-stone-50 dark:bg-stone-850 rounded-xl"
                    aria-label="Back to conversations list"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner select-none">
                    {activeUserDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[var(--text-dark)] capitalize leading-tight">
                      {activeUserDetail.name}
                    </h3>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider select-none">
                      {getRoleLabel(activeUserDetail.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Thread history */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeMessages.map((msg) => {
                  const isSentByMe = msg.sender === (user.id || user._id);
                  return (
                    <div
                      key={msg.id || msg._id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm border text-sm leading-relaxed ${
                          isSentByMe
                            ? 'bg-primary text-white border-primary/20 rounded-tr-none'
                            : 'bg-white dark:bg-stone-900 text-[var(--text-body)] border-stone-200 dark:border-stone-850 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <span
                          className={`block text-[9px] text-right mt-1.5 font-bold ${
                            isSentByMe ? 'text-white/70' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Real-time Typing Indicator bubble */}
                {isTyping && (
                  <div className="flex justify-start select-none">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <span className="text-xs text-[var(--text-muted)] font-semibold italic mr-1">
                        {activeUserDetail.name} typing
                      </span>
                      <span className="w-1 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-[var(--border-light)] bg-white dark:bg-stone-900/40 shrink-0 flex gap-3 items-center select-none"
              >
                <div className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl hover:border-stone-300 dark:hover:border-stone-850 transition duration-150">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    aria-label="Message text inputs"
                    className="w-full bg-transparent text-sm text-[var(--text-body)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!messageInput.trim()}
                  variant="primary"
                  className="h-11 w-11 rounded-full shrink-0 flex items-center justify-center shadow-md p-0"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 select-none flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-5 shadow-sm">
                <MessageSquare size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-[var(--text-dark)] mb-2">Your Messages</h3>
              <p className="max-w-md text-sm text-[var(--text-muted)] leading-relaxed font-semibold">
                Select an active conversation thread from the list, or contact coordinates directly from your inquiries list to coordinate booking dates.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
