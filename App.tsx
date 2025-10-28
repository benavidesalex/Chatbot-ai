import React, { useState } from 'react';
import type { ChatMessage, GroundingChunk } from './types';
import { streamChatResponse } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  content: "¡Hola! Soy un asistente de IA especializado. Solo puedo responder preguntas sobre la Política de Seguridad de TI de Tecnoglass, basándome en la información de https://ciberseguridad.tecnoglass.com.",
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userInput },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'model', content: '' },
    ]);

    try {
      const stream = streamChatResponse(newMessages);
      const allGroundingChunks = new Map<string, GroundingChunk['web']>();

      for await (const part of stream) {
        if (part.groundingChunks) {
          part.groundingChunks.forEach(chunk => {
            if (chunk.web?.uri) {
              allGroundingChunks.set(chunk.web.uri, chunk.web);
            }
          });
        }

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.role === 'model') {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + (part.text || ''),
              groundingChunks: Array.from(allGroundingChunks.values()).map(web => ({ web })),
            };
            return updatedMessages;
          }
          return prevMessages;
        });
      }
    } catch (err) {
      const errorMessage = 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
       setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.role === 'model' && lastMessage.content === '') {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = {
              ...lastMessage,
              content: errorMessage,
            };
            return updatedMessages;
          }
          return [...prevMessages, {role: 'model', content: errorMessage}];
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col h-screen font-sans w-full max-w-2xl mx-auto">
       <div className="flex-shrink-0">
         <Header onClearChat={handleClearChat} />
       </div>
       <div className="flex-grow overflow-hidden flex flex-col">
         <ChatWindow messages={messages} isLoading={isLoading} />
       </div>
       <div className="flex-shrink-0 p-4 bg-gray-900 border-t border-gray-700">
         <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
          />
          <p className="text-center text-xs text-gray-500 mt-3">
            Las respuestas se basan en información pública y pueden incluir enlaces a las fuentes.
          </p>
       </div>
    </div>
  );
};

export default App;