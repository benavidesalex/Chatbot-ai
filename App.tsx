import React, { useState } from 'react';
import type { ChatMessage, GroundingChunk } from './types';
//import { streamChatResponse } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  content: "¡Hola! Soy un asistente de IA especializado. Solo puedo responder preguntas sobre la Política de Seguridad de TI de Tecnoglass, basándome en la información de https://ciberseguridad.tecnoglass.com.",
};

// Línea a agregar después de las otras importaciones
const WORKER_URL = "https://chatbot-api-worker.tecnoesw3.workers.dev"; // <<<<< ¡PON TU URL AQUÍ!

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

    
  // INICIO DEL REEMPLAZO (Aproximadamente Línea 36)
try {
    // La petición solo envía el último mensaje del usuario, no el historial completo,
    // ya que nuestro Worker simplificado solo espera el 'prompt'.
    const userPrompt = userInput.trim();

    const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Enviamos el mensaje del usuario con la clave 'prompt', que es lo que el Worker espera
        body: JSON.stringify({ prompt: userPrompt }), 
    });

    const data = await response.json();

    if (!response.ok) {
        // Manejo de errores si el Worker devuelve un estado no exitoso (ej. 400, 500)
        throw new Error(data.error || "El servidor del chatbot devolvió un error. Código: " + response.status);
    }
    
    const botResponseText = data.response || "No se recibió respuesta del modelo.";

    // Actualiza la última respuesta del modelo de forma atómica (no streaming)
    setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage.role === 'model') {
            const updatedMessages = [...prevMessages];
            updatedMessages[prevMessages.length - 1] = {
                ...lastMessage,
                content: botResponseText,
                // Si ya no manejamos "groundingChunks" en el Worker, esta propiedad puede necesitar limpieza o eliminación.
                // Por ahora, la dejamos como null si no la devuelve el Worker.
                groundingChunks: lastMessage.groundingChunks || [], 
            };
            return updatedMessages;
        }
        // Si por alguna razón la última no es del modelo (no debería pasar), agregamos la nueva.
        return [...prevMessages, { role: 'model', content: botResponseText }]; 
    });

} catch (err) {
    const errorMessage = 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.';
    setError(errorMessage);
    setMessages((prevMessages) => {
        // Lógica de manejo de errores mejorada
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
// FIN DEL REEMPLAZO  
    
    
    
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
