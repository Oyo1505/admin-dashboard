interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void; // eslint-disable-line no-unused-vars
  isVisible: boolean;
}

const ChatSuggestions = ({
  onSuggestionClick,
  isVisible,
}: ChatSuggestionsProps) => {
  const suggestions = [
    "Peux-tu me recommander des films d'action récents ?",
    'Quels sont les meilleurs films de 2024 ?',
    'Je cherche des films japonais à voir',
    'Des films de science-fiction avec des liens vers les pages',
    'Peux-tu me recommander des films de ce réalisateur ?',
    'Montre-moi des films avec des liens cliquables',
  ];

  if (!isVisible) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-t border-gray-200">
      <span className="text-xs text-gray-600 w-full mb-2">
        💡 Suggestions de questions :
      </span>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
