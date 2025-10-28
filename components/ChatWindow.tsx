
import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
      {isLoading && messages[messages.length-1].role === 'user' && (
        <Message message={{ role: 'model', content: '...' }} />
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatWindow;
