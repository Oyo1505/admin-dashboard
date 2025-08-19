'use client';
import { useState } from 'react';
import { threadChatBot } from '../mistral.action';
import { testMistralAPI } from '../test-mistral';
import { testLinksGeneration } from '../test-links';
import { useLocale } from 'next-intl';

const ChatDebug = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [apiTest, setApiTest] = useState('');
  const [linksTest, setLinksTest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isTestingLinks, setIsTestingLinks] = useState(false);
  const locale = useLocale();

  const handleTest = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const result = await threadChatBot(message, locale);
      setResponse(result.answer);
    } catch (error) {
      console.error('Erreur de test:', error);
      setResponse('Erreur: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setIsTestingAPI(true);
    try {
      const result = await testMistralAPI();
      setApiTest(
        result.success
          ? `✅ API OK: ${result.answer}`
          : `❌ Erreur: ${result.error}`
      );
    } catch (error) {
      setApiTest(`❌ Erreur: ${error}`);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const handleTestLinks = async () => {
    setIsTestingLinks(true);
    try {
      const result = await testLinksGeneration();
      if (result.success) {
        setLinksTest(
          `✅ Liens générés: ${result.hasLinks ? 'OUI' : 'NON'} | Liens films: ${result.hasMovieLinks ? 'OUI' : 'NON'}`
        );
      } else {
        setLinksTest(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setLinksTest(`❌ Erreur: ${error}`);
    } finally {
      setIsTestingLinks(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 max-w-md">
      <h3 className="text-lg font-bold mb-4">Test ChatBot</h3>

      <div className="space-y-4">
        {/* Test API Mistral */}
        <div>
          <button
            onClick={handleTestAPI}
            disabled={isTestingAPI}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 mb-2"
          >
            {isTestingAPI ? 'Test API...' : 'Tester API Mistral'}
          </button>
          {apiTest && (
            <div className="p-2 bg-white border rounded text-xs">{apiTest}</div>
          )}
        </div>

        <div>
          <button
            onClick={handleTestLinks}
            disabled={isTestingLinks}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300 mb-2"
          >
            {isTestingLinks ? 'Test Liens...' : 'Tester Génération Liens'}
          </button>
          {linksTest && (
            <div className="p-2 bg-white border rounded text-xs">
              {linksTest}
            </div>
          )}
        </div>

        <hr />

        <div>
          <label className="block text-sm font-medium mb-2">Message:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Tapez votre message..."
          />
          <div className="mt-2 text-xs text-gray-600">
            <p>Exemples pour tester les liens :</p>
            <ul className="list-disc list-inside mt-1">
              <li>&ldquo;Recommande-moi 3 films avec des liens&rdquo;</li>
              <li>&ldquo;Films d&apos;action récents avec liens&rdquo;</li>
              <li>&ldquo;Meilleurs films de 2024 avec pages&rdquo;</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={isLoading || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Test en cours...' : 'Tester ChatBot'}
        </button>

        {response && (
          <div>
            <label className="block text-sm font-medium mb-2">Réponse:</label>
            <div className="p-3 bg-white border rounded text-sm">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDebug;
