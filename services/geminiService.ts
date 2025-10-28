import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Eres un asistente de IA y tu única función es responder preguntas sobre el documento de la política de seguridad de TI de Tecnoglass, utilizando exclusivamente la información del sitio web 'https://ciberseguridad.tecnoglass.com'. No debes responder a ninguna otra pregunta o tema. Si un usuario te pregunta sobre algo que no sea la política de seguridad de TI de Tecnoglass o te pide información que no se encuentra en 'https://ciberseguridad.tecnoglass.com', debes negarte a responder amablemente. Tu respuesta en ese caso debe ser algo como: 'Lo siento, solo puedo proporcionar información sobre la política de seguridad de TI de Tecnoglass basada en el contenido de https://ciberseguridad.tecnoglass.com'. No interactúes sobre ningún otro tema. Cita siempre tus fuentes de 'https://ciberseguridad.tecnoglass.com'. Todas las respuestas deben estar en español. Formatea tus respuestas para que sean claras y fáciles de leer usando markdown.`;

export async function* streamChatResponse(history: ChatMessage[]): AsyncGenerator<{ text?: string; groundingChunks?: any[] }, void, unknown> {
    const historyForApi = history.slice(1); // Remove initial greeting

    if (historyForApi.length === 0) {
        return;
    }

    const contents = historyForApi.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
        },
    });

    for await (const chunk of responseStream) {
        yield {
            text: chunk.text,
            groundingChunks: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
    }
}