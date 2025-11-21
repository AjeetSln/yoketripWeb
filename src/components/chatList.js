import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ChatService from '../services/ChatService';

function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineStatus, setOnlineStatus] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const navigate = useNavigate();
  const { receiverId } = useParams();

  const loadConversations = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setIsLoading(false);
      setHasError(true);
      toast.error('Please log in to view conversations');
      return;
    }

    try {
      const response = await axios.get('https://yoketrip.in/api/messages/conversations/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedConversations = response.data.conversations.sort((a, b) => {
        const aUserId = a.otherUser?._id || '';
        const bUserId = b.otherUser?._id || '';
        const aIsOnline = onlineStatus[aUserId] || false;
        const bIsOnline = onlineStatus[bUserId] || false;
        return aIsOnline && !bIsOnline ? -1 : !aIsOnline && bIsOnline ? 1 : 0;
      });

      setConversations(sortedConversations);
      setFilteredConversations(sortedConversations);
      setHasError(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setHasError(true);
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handlePresenceUpdate = (data) => {
      if (!isMounted) return;
      const userId = data.userId;
      if (userId) {
        setOnlineStatus((prev) => ({ ...prev, [userId]: !!data.isOnline }));
        setLastSeen((prev) => ({
          ...prev,
          [userId]: data.isOnline ? null : data.lastSeen ? new Date(data.lastSeen) : new Date(),
        }));
      }
    };

    const messageHandler = (e) => {
      if (!isMounted) return;
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data.type === 'new_message') {
        loadConversations();
      } else if (data.type === 'presence' || data.type === 'presence_update') {
        handlePresenceUpdate(data);
      }
    };

    const connectToWebSocket = async () => {
      if (ChatService.socket?.connected) return;
      if (!isMounted) return;
      try {
        await ChatService.connect((data) => {
          if (!isMounted) return;
          if (data.type === 'new_message') {
            loadConversations();
          } else if (data.type === 'presence' || data.type === 'presence_update') {
            handlePresenceUpdate(data);
          }
        });

        if (isMounted && ChatService.messageStream && !ChatService.messageStream.closed) {
          ChatService.messageStream.addEventListener('message', messageHandler);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          toast.error(`Connection error: ${error.message}`);
        }
      }
    };

    loadConversations();
    connectToWebSocket();

    return () => {
      isMounted = false;
      if (ChatService.messageStream && !ChatService.messageStream.closed) {
        ChatService.messageStream.removeEventListener('message', messageHandler);
      }
      ChatService.disconnect();
    };
  }, []);

  const filterConversations = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      setFilteredConversations(
        conversations.filter((conv) => {
          const isSelfConversation = conv.isSelfConversation || false;
          const name = isSelfConversation ? 'Your Notes' : (conv.otherUser?.full_name || '').toLowerCase();
          return name.includes(query.toLowerCase());
        })
      );
    }
  };

  // --- पूरी तरह से सुधारा हुआ फ़ंक्शन ---
  const formatToIST = (utcTime) => {
    if (!utcTime) return '';

    const messageDate = new Date(utcTime);
    const now = new Date();

    // एक डेट फॉर्मैटर बनाएं जो IST में YYYY-MM-DD फॉर्मेट देता है
    const dateStringFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    // आज की और मैसेज की तारीख को स्ट्रिंग में बदलें
    const todayDateString = dateStringFormatter.format(now);
    const messageDateString = dateStringFormatter.format(messageDate);
    
    // कल की तारीख का स्ट्रिंग बनाएं
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayDateString = dateStringFormatter.format(yesterday);

    if (messageDateString === todayDateString) {
        // अगर तारीख आज की है, तो सिर्फ समय दिखाएं
        return new Intl.DateTimeFormat('en-IN', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'Asia/Kolkata',
        }).format(messageDate);
    }

    if (messageDateString === yesterdayDateString) {
        // अगर तारीख कल की है
        return 'Yesterday';
    }

    // जांच करें कि क्या तारीख पिछले 7 दिनों के भीतर है
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    if (messageDate > weekAgo) {
        // अगर हाँ, तो दिन का नाम दिखाएं
        return new Intl.DateTimeFormat('en-IN', {
            weekday: 'long',
            timeZone: 'Asia/Kolkata',
        }).format(messageDate);
    }
    
    // अगर 7 दिन से भी पुरानी है, तो पूरी तारीख दिखाएं
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    }).format(messageDate);
  };

  const formatLastSeen = (lastSeenTime, isOnline) => {
    if (isOnline) return 'Online';
    if (!lastSeenTime) return 'Offline';
    const now = new Date();
    const difference = (now - new Date(lastSeenTime)) / 1000;

    if (difference < 60) return 'Last seen just now';
    if (difference < 3600) return `Last seen ${Math.floor(difference / 60)} min ago`;
    if (difference < 86400) return `Last seen ${Math.floor(difference / 3600)} hour${Math.floor(difference / 3600) > 1 ? 's' : ''} ago`;
    return `Last seen on ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(lastSeenTime))}`;
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-teal-700 text-white py-3 px-4 shadow-md z-10">
        <div className="flex items-center justify-between">
        </div>
        <div className="mt-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => filterConversations(e.target.value)}
              placeholder="Search chats..."
              className="w-full p-2 pl-10 pr-10 rounded-full bg-gray-200 text-black text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button onClick={() => filterConversations('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <i className="material-icons text-sm">clear</i>
              </button>
            )}
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <i className="material-icons text-sm">search</i>
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-2 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-600"></div>
            <p className="ml-2 text-teal-700 font-semibold">Loading Conversations...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="material-icons text-6xl text-gray-400">error_outline</span>
            <p className="mt-2 text-gray-600">Error loading conversations</p>
            <button onClick={loadConversations} className="mt-2 text-teal-700 hover:underline">
              Retry
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="material-icons text-6xl text-gray-400">message</span>
            <p className="mt-2 text-gray-600">{searchQuery ? 'No conversations found' : 'No Messages'}</p>
            {searchQuery === '' && (
              <button onClick={loadConversations} className="mt-2 text-teal-700 hover:underline">
                Refresh
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.lastMessage || {};
              const otherUser = conversation.otherUser || {};
              const isLastMessageFromMe = lastMessage.isFromMe || false;
              const isSelfConversation = conversation.isSelfConversation || false;
              const profilePic = otherUser.profilePic || '';
              const fullName = otherUser.full_name || 'Unknown User';
              const content = lastMessage.content || '';
              const createdAt = lastMessage.createdAt || '';
              const unreadCount = conversation.unreadCount || 0;
              const otherUserId = otherUser._id || '';
              const isOnline = onlineStatus[otherUserId] || false;
              const userLastSeen = lastSeen[otherUserId];
              const isActive = receiverId === otherUserId;

              return (
                <div
                  key={conversation._id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                    isActive ? 'bg-teal-100' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const receiverName = isSelfConversation ? 'Your Notes' : fullName;
                    const receiverImage = profilePic;
                    navigate(`/userchat/${otherUserId}`, {
                      state: { receiverName, receiverImage },
                    });
                  }}
                >
                  <div className="relative">
                    <img
                      src={profilePic || '/assets/profilePic.png'}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                      onError={(e) => (e.target.src = '/assets/profilePic.png')}
                    />
                    {!isSelfConversation && (
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}
                      ></span>
                    )}
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="flex justify-between">
                      <p className="font-semibold text-teal-800 truncate text-base">
                        {isSelfConversation ? 'Your Notes' : fullName}
                      </p>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatToIST(createdAt)}</p>
                        {unreadCount > 0 && (
                          <span className="inline-block px-2 py-1 text-xs text-white bg-teal-600 rounded-full mt-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {isLastMessageFromMe && !isSelfConversation ? `You: ${content}` : content}
                    </p>
                    {!isSelfConversation && (
                      <div className="flex items-center text-xs">
                        <span
                          className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}
                        ></span>
                        <span className={isOnline ? 'text-green-500' : 'text-gray-500'}>
                          {formatLastSeen(userLastSeen, isOnline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;