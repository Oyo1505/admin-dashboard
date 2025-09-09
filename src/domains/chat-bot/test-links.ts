'use server';
import { logError } from '@/lib/errors';
import { threadChatBot } from './mistral.action';

export async function testLinksGeneration() {
  try {
    console.log('Test de génération de liens...');

    const testMessage =
      'Peux-tu me recommander 3 films avec des liens vers leurs pages ?';
    const result = await threadChatBot(testMessage, 'fr');

    console.log('Réponse avec liens:', result.answer);

    const hasLinks = result.answer.includes('<a href=');
    const hasMovieLinks = result.answer.includes('/movies/');

    return {
      success: result.status === 200,
      hasLinks: hasLinks,
      hasMovieLinks: hasMovieLinks,
      answer: result.answer,
      error: null,
    };
  } catch (error) {
    logError(error, 'testMistralAPI');
    return {
      success: false,
      hasLinks: false,
      hasMovieLinks: false,
      answer: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
