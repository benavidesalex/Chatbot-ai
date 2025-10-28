import React from 'react';
import type { ChatMessage } from '../types';
import { BotIcon, UserIcon, LinkIcon } from './IconComponents';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  const formattedContent = message.content.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
                                          .replace(/(`)(.*?)\1/g, '<code class="bg-gray-700 rounded px-1 py-0.5 text-sm font-mono">$2</code>')
                                          .replace(/\n/g, '<br />');


  return (
    <div className={`flex items-start gap-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <BotIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-md ${
          isModel ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        { message.content === '...' ? (
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
        {message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Fuentes:</h4>
            <ul className="space-y-1.5">
              {message.groundingChunks.map((chunk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <LinkIcon className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs break-all">
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!isModel && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <UserIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default Message;