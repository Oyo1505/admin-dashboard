'use server';
import { mistral } from '@/lib/mistral';

export async function testMistralAPI() {
  try {
    console.log('API Test Mistral...');

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant amical. Réponds simplement "Bonjour !"',
        },
        {
          role: 'user',
          content: 'Salut !',
        },
      ],
    });

    const answer = response?.choices?.[0]?.message?.content;
    console.log('Answer Mistral:', answer);

    return {
      success: true,
      answer: answer,
      error: null,
    };
  } catch (error) {
    console.error('Erreur API Mistral:', error);
    return {
      success: false,
      answer: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
