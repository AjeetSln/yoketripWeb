import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';

import { toast } from 'react-toastify';

import ChatService from '../services/ChatService';

import ChatMessage from '../models/ChatMessage';



function UserChat() {

    const { receiverId } = useParams();

    const { state } = useLocation();

    const navigate = useNavigate();



    const [receiverName, setReceiverName] = useState(state?.receiverName || 'Loading...');

    const [receiverImage, setReceiverImage] = useState(state?.receiverImage || '/assets/profilePic.png');

    const [messages, setMessages] = useState([]);

    const [messageInput, setMessageInput] = useState('');

    const [isTyping, setIsTyping] = useState(false);

    const [isOnline, setIsOnline] = useState(false);

    const [lastSeen, setLastSeen] = useState(null);

    const [isSending, setIsSending] = useState(false);

    const [showReconnecting, setShowReconnecting] = useState(false);

    const messagesEndRef = useRef(null);

    const messagesContainerRef = useRef(null);

    const typingTimerRef = useRef(null);



    const scrollToBottom = (behavior = 'smooth') => {

        if (messagesEndRef.current && messagesContainerRef.current) {

            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;

        }

    };



    const isNearBottom = () => {

        if (!messagesContainerRef.current) return true;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

        return scrollHeight - scrollTop - clientHeight < 100;

    };



    const fetchReceiverDetails = async () => {

        try {

            const token = localStorage.getItem('auth_token');

            if (!token || !receiverId) return;

            const response = await axios.get(`https://yoketrip.in/api/user/${receiverId}`, {

                headers: { Authorization: `Bearer ${token}` },

            });

            if (response.data.success) {

                setReceiverName(response.data.user.full_name || 'Unknown User');

                setReceiverImage(response.data.user.profilePic || '/assets/profilePic.png');

            }

        } catch (error) {

            console.error('Failed to fetch receiver details:', error);

        }

    };



    const handlePresenceUpdate = (data) => {

        if (data.userId === receiverId) {

            setIsOnline(!!data.isOnline);

            setLastSeen(data.isOnline ? null : data.lastSeen ? new Date(data.lastSeen) : new Date());

        }

    };



    const connectToWebSocket = async () => {

        if (showReconnecting || ChatService.socket?.connected) return;

        setShowReconnecting(true);

        try {

            await ChatService.connect((data) => {

                if (data.type === 'new_message') {

                    const message = ChatMessage.fromJson(data.message);

                    if (message.senderId === receiverId || message.receiverId === receiverId) {

                        setMessages((prev) => {

                            const filteredMessages = prev.filter(

                                (m) => !(m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId)

                            );

                            const exists = filteredMessages.some((m) => m.id === message.id);

                            if (!exists) {

                                return [...filteredMessages, message];

                            }

                            return filteredMessages;

                        });

                    }

                } else if (data.type === 'typing' && data.senderId === receiverId) {

                    setIsTyping(data.isTyping);

                } else if (data.type === 'presence' || data.type === 'presence_update') {

                    handlePresenceUpdate(data);

                }

            });

            setShowReconnecting(false);

        } catch (error) {

            setShowReconnecting(false);

            toast.error(`Failed to connect to chat server: ${error.message}`);

        }

    };



    const loadInitialMessages = async (retryCount = 0) => {

        const maxRetries = 3;

        try {

            const token = localStorage.getItem('auth_token');

            if (!token || !receiverId) {

                toast.error('Please log in or select a valid user to chat with');

                navigate('/userchat');

                return;

            }



            const response = await axios.get(`https://yoketrip.in/api/messages/${receiverId}`, {

                headers: { Authorization: `Bearer ${token}` },

            });



            if (response.data.success) {

                const newMessages = response.data.messages.map(ChatMessage.fromJson).reverse();

                setMessages(newMessages);

            } else {

                throw new Error(response.data.message);

            }

        } catch (error) {

            if (retryCount < maxRetries) {

                setTimeout(() => loadInitialMessages(retryCount + 1), 2000 * (retryCount + 1));

            } else {

                toast.error(`Failed to load messages: ${error.message}`);

            }

        }

    };





    useEffect(() => {

        fetchReceiverDetails();

        loadInitialMessages();

        connectToWebSocket();



        return () => {

            ChatService.disconnect();

            clearTimeout(typingTimerRef.current);

        };

    }, [receiverId]);



    useLayoutEffect(() => {

        scrollToBottom('auto');

    }, [receiverId, messages]);



    const sendMessage = async () => {

        if (messageInput.trim() === '' || isSending) return;



        const tempId = `temp-${Date.now()}-${Math.random()}`;

        const optimisticMessage = new ChatMessage({

            id: tempId,

            senderId: localStorage.getItem('user_id'),

            receiverId,

            content: messageInput.trim(),

            createdAt: new Date(),

            isRead: false,

        });



        setMessages((prev) => [...prev, optimisticMessage]);

        setMessageInput('');

        setIsSending(true);



        try {

            await ChatService.sendMessage(receiverId, messageInput.trim());

            if (isNearBottom()) {

                setTimeout(() => scrollToBottom('smooth'), 100);

            }

        } catch (error) {

            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

            toast.error('Failed to send message');

        } finally {

            setIsSending(false);

        }

    };



    const handleTyping = () => {

        clearTimeout(typingTimerRef.current);

        ChatService.sendTyping(receiverId, messageInput.trim() !== '');

        typingTimerRef.current = setTimeout(() => {

            ChatService.sendTyping(receiverId, false);

        }, 3000);

    };



    const formatLastSeen = (lastSeen, isOnline) => {

        if (isOnline) return 'Online';

        if (!lastSeen) return 'Offline';

        const now = new Date();

        const difference = (now - new Date(lastSeen)) / 1000;



        if (difference < 60) return 'Last seen just now';

        if (difference < 3600) return `Last seen ${Math.floor(difference / 60)} min ago`;

        if (difference < 86400) return `Last seen ${Math.floor(difference / 3600)} hour${Math.floor(difference / 3600) > 1 ? 's' : ''} ago`;

        return `Last seen ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(lastSeen))}`;

    };



    const formatMessageDate = (date) => {

        const now = new Date();

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());



        if (today.toDateString() === messageDate.toDateString()) return 'Today';

        if (yesterday.toDateString() === messageDate.toDateString()) return 'Yesterday';

        if (now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {

            return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

        }

        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

    };



    return (

        <div className="h-screen flex flex-col bg-gray-100">

            {/* Header - No longer 'fixed' */}

            <div className="bg-teal-700 text-white flex items-center px-3 py-2.5 shadow-md">

                <button onClick={() => navigate('/userchat')} className="mr-3 text-white focus:outline-none md:hidden">

                    <i className="material-icons text-2xl">arrow_back</i>

                </button>

                <img

                    src={receiverImage}

                    alt="Profile"

                    className="w-10 h-10 rounded-full border border-white"

                    onError={(e) => (e.target.src = '/assets/profilePic.png')}

                />

                <div className="ml-3 flex-1">

                    <p className="font-semibold text-lg truncate">{receiverName}</p>

                    <div className="flex items-center text-xs">

                        <span

                            className={`w-2 h-2 rounded-full mr-1 ${showReconnecting ? 'bg-orange-400' : isOnline ? 'bg-green-400' : 'bg-gray-400'}`}

                        ></span>

                        <span className={showReconnecting ? 'text-orange-200' : isOnline ? 'text-green-200' : 'text-gray-200'}>

                            {showReconnecting ? 'Reconnecting...' : formatLastSeen(lastSeen, isOnline)}

                        </span>

                    </div>

                </div>

                {!ChatService.socket?.connected && !showReconnecting && (

                    <button onClick={connectToWebSocket} className="text-white focus:outline-none">

                        <i className="material-icons text-2xl">refresh</i>

                    </button>

                )}

            </div>



            {/* Scrollable Messages Area */}

            <div

                className="flex-1 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-gray-100"

                ref={messagesContainerRef}

                style={{ touchAction: 'pan-y' }}

            >

                {isTyping && (

                    <div className="px-4 py-2 text-gray-500 text-sm italic flex items-center">

                        <span>{receiverName} is typing</span>

                        <span className="animate-bounce inline-block ml-1">.</span>

                        <span className="animate-bounce inline-block delay-100">.</span>

                        <span className="animate-bounce inline-block delay-200">.</span>

                    </div>

                )}

                <div className="px-4 py-2">

                    {messages.map((message, index) => {

                        const isMe = message.senderId !== receiverId;

                        const prevMessage = index > 0 ? messages[index - 1] : null;

                        const showDateHeader =

                            !prevMessage ||

                            new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();



                        return (

                            <div key={message.id}>

                                {showDateHeader && (

                                    <div className="text-center my-3">

                                        <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">

                                            {formatMessageDate(message.createdAt)}

                                        </span>

                                    </div>

                                )}

                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>

                                    <div

                                        className={`max-w-[70%] p-3 rounded-lg shadow-md ${isMe ? 'bg-green-200 text-black rounded-br-none' : 'bg-white text-black rounded-bl-none'

                                            }`}

                                        style={{ borderRadius: '10px' }}

                                    >

                                        <p className="text-sm break-words">{message.content}</p>

                                        <p className="text-xs text-gray-500 mt-1 text-right flex items-center justify-end">

                                            <span>

                                                {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(

                                                    message.createdAt

                                                )}

                                            </span>

                                            {isMe && (

                                                <span className="ml-1">

                                                    {message.id.startsWith('temp-') ? (

                                                        <i className="material-icons text-sm text-gray-400">schedule</i>

                                                    ) : message.isRead ? (

                                                        <i className="material-icons text-sm text-blue-500">done_all</i>

                                                    ) : (

                                                        <i className="material-icons text-sm text-gray-500">done</i>

                                                    )}

                                                </span>

                                            )}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                    <div ref={messagesEndRef} />

                </div>

            </div>



            {/* Footer (Input Area) - No longer 'fixed' */}

            <div className="bg-white border-t border-gray-200 py-2 px-3 shadow-inner">

                <div className="flex items-center">

                    <input

                        type="text"

                        value={messageInput}

                        onChange={(e) => {

                            setMessageInput(e.target.value);

                            handleTyping();

                        }}

                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}

                        placeholder="Type a message..."

                        className="flex-1 p-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-100 text-sm"

                        disabled={isSending}

                    />

                    <button

                        onClick={sendMessage}

                        disabled={isSending || messageInput.trim() === ''}

                        className={`ml-2 p-2.5 rounded-full text-white transition-colors focus:outline-none ${isSending || messageInput.trim() === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600'

                            }`}

                    >

                        <i className="material-icons text-xl">send</i>

                    </button>

                </div>

            </div>

        </div>

    );

}



export default UserChat;