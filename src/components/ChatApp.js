import React from 'react';
import { useParams } from 'react-router-dom';
import ChatList from './chatList';
import UserChat from './UserChat';

function ChatApp() {
  const { receiverId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* ChatList Sidebar */}
      <div
        className={`w-full md:w-96 bg-white border-r border-gray-200 ${
          receiverId ? 'hidden md:block' : 'block'
        } h-screen relative`}
      >
        <ChatList />
      </div>

      {/* UserChat Main Area */}
      <div
        className={`flex-1 ${
          receiverId ? 'block' : 'hidden md:flex md:items-center md:justify-center'
        } h-screen relative`}
      >
        {receiverId ? (
          <UserChat key={receiverId} />
        ) : (
          <div className="text-center text-gray-600 flex flex-col items-center justify-center h-full">
            <span className="material-icons text-6xl mb-2">chat</span>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;