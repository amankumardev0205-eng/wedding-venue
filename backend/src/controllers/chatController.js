import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get message history with a specific user
// @route   GET /api/chat/messages/:otherUserId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId }
      ]
    }).sort({ createdAt: 1 }).lean().exec();

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active conversation threads
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    const allMessages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    }).sort({ createdAt: -1 }).lean().exec();

    const conversationMap = {};

    for (const msg of allMessages) {
      const otherUserId = msg.sender === myId ? msg.receiver : msg.sender;
      if (!otherUserId) continue;

      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = {
          lastMessage: msg,
          unreadCount: 0
        };
      }

      if (msg.receiver === myId && msg.sender === otherUserId && !msg.read) {
        conversationMap[otherUserId].unreadCount += 1;
      }
    }

    const conversations = [];
    for (const [otherUserId, data] of Object.entries(conversationMap)) {
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) continue;

      conversations.push({
        otherUser: {
          id: otherUser.id || otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role
        },
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount
      });
    }

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message via HTTP REST (fallback or client post)
// @route   POST /api/chat/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiver, text, inquiryId } = req.body;
    const sender = req.user.id;

    if (!receiver || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }

    const newMessage = new Message({
      sender,
      receiver,
      text,
      inquiry: inquiryId || null,
      read: false,
      createdAt: new Date().toISOString()
    });

    await newMessage.save();

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark messages as read from a specific sender
// @route   POST /api/chat/read/:otherUserId
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const myId = req.user.id;
    const { otherUserId } = req.params;

    const unreadMessages = await Message.find({
      sender: otherUserId,
      receiver: myId,
      read: false
    }).exec();

    for (const msg of unreadMessages) {
      await Message.findByIdAndUpdate(msg.id || msg._id, { read: true });
    }

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
