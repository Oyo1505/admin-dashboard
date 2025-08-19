'use client';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { Input } from '@/domains/ui/components/input/input';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { threadChatBot } from '../mistral.action';
import { ChatBotLogo } from '@/domains/ui/components/icons/icons';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';
import { usePathname } from 'next/navigation';
import { ChatMessage } from '../interfaces/chat.interface';
import ChatSuggestions from './chat-suggestions';
import { Cross1Icon } from '@radix-ui/react-icons';

const ChatBot = () => {
  const t = useTranslations('ChatBot');
  const [isChatBotEnabled, setIsChatBotEnabled] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatBotHistory');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch (e) {
          console.error("Erreur lors du chargement de l'historique:", e);
        }
      }
    }
    return [
      {
        role: 'assistant',
        message: t('placeholder'),
        timestamp: new Date(),
        id: 'welcome',
      },
    ];
  });

  const locale = useLocale();
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      message: '',
    },
  });

  const message = watch('message');

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('chatBotHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const handleTransitionEnd = () => {
    if (isChatBotEnabled) {
      setIsAnimationComplete(true);
    } else {
      setIsAnimationComplete(false);
    }
  };

  const handleCloseChatBot = () => {
    setIsChatBotEnabled(false);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        message: t('placeholder'),
        timestamp: new Date(),
        id: 'welcome',
      },
    ]);
    localStorage.removeItem('chatBotHistory');
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    try {
      setIsLoading(true);

      const userMsg: ChatMessage = {
        role: 'user',
        message: userMessage.trim(),
        timestamp: new Date(),
        id: `user-${Date.now()}`,
      };

      setMessages((prev) => [...prev, userMsg]);
      const { answer } = await threadChatBot(
        userMessage.trim(),
        locale,
        messages
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        message: answer,
        timestamp: new Date(),
        id: `assistant-${Date.now()}`,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        message: t('error'),
        timestamp: new Date(),
        id: `error-${Date.now()}`,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return;

    await sendMessage(data.message);
    reset();
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (pathname === '/') return null;

  return (
    <div
      onClick={() => !isChatBotEnabled && setIsChatBotEnabled(true)}
      onTransitionEnd={handleTransitionEnd}
      className={clsx(
        'fixed bottom-10 z-20 right-10 w-20 h-20 text-black hidden md:block bg-white shadow-lg transition-all duration-300 ease-in-out border border-gray-300',
        isChatBotEnabled
          ? 'rounded-lg h-[500px] w-[400px]'
          : 'rounded-full w-20 h-20 hover:cursor-pointer hover:shadow-xl hover:scale-105'
      )}
    >
      {isChatBotEnabled && isAnimationComplete ? (
        <div className="relative flex overflow-hidden flex-col items-center justify-between h-full w-full p-4 gap-2">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 text-white p-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6">
                  <ChatBotLogo className="w-6 h-6" />
                </div>
                <span className="font-medium text-xs">{t('title')}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="text-xs bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors"
                  title={t('clearChat')}
                >
                  🗑️
                </button>
                <button
                  onClick={handleCloseChatBot}
                  className="text-xs bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 p-1 flex items-center justify-center transition-colors"
                  title="Fermer"
                >
                  <Cross1Icon />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="w-full h-full pt-12 pb-32 flex flex-col gap-3 overflow-y-auto scroll-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          >
            {messages.map((message: ChatMessage) => (
              <div
                key={message.id}
                className={clsx(
                  'flex flex-col gap-1 max-w-[85%]',
                  message.role === 'assistant' ? 'self-start' : 'self-end'
                )}
              >
                <div
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm shadow-sm',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-gradient-to-r from-slate-50 to-slate-100 text-gray-700 border border-slate-200'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.message }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.message}</div>
                  )}
                </div>
                <span className="text-xs text-gray-500 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col gap-1 self-start max-w-[85%]">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-xs text-gray-600">
                      {t('thinking')}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 px-1">
                  {formatTime(new Date())}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatSuggestions
            onSuggestionClick={handleSuggestionClick}
            isVisible={messages.length === 1 && !isLoading}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              <Input
                placeholder={t('placeholderMessage')}
                className="flex-1 text-sm"
                disabled={isLoading}
                {...register('message', {
                  required: 'Veuillez saisir un message',
                  minLength: {
                    value: 1,
                    message: 'Le message ne peut pas être vide',
                  },
                })}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isLoading || !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 hover:shadow-md'
                )}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </form>
            {errors.message && (
              <span className="text-xs text-red-500 mt-1">
                {errors.message.message}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <ChatBotLogo />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
