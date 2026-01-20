'use client';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { ChatBotLogo } from '@/domains/ui/components/icons/icons';
import { Input } from '@/domains/ui/components/input/input';
import { logError } from '@/lib/errors';
import { Cross1Icon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChatMessage } from '../interfaces/chat.interface';
import { threadChatBot } from '../mistral.action';

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
          return parsed.map((msg: ChatMessage) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch (error) {
          logError(error, 'ChatBot -> messages');
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
      logError(error, 'sendMessage');
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  if (pathname === '/') return null;

  // Closed state - accessible button
  if (!isChatBotEnabled) {
    return (
      <button
        type="button"
        onClick={() => setIsChatBotEnabled(true)}
        onTransitionEnd={handleTransitionEnd}
        aria-label={t('openChat')}
        className="fixed bottom-10 z-20 right-10 w-20 h-20 text-black hidden md:flex bg-white shadow-lg transition-[width,height,border-radius,box-shadow,transform] duration-300 ease-in-out border border-gray-300 rounded-full items-center justify-center hover:cursor-pointer hover:shadow-xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ChatBotLogo aria-hidden="true" />
      </button>
    );
  }

  // Open state - dialog
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      onTransitionEnd={handleTransitionEnd}
      className="fixed bottom-10 z-20 right-10 text-black hidden md:block bg-white shadow-lg transition-[width,height,border-radius,box-shadow,transform] duration-300 ease-in-out border border-gray-300 rounded-lg h-125 w-100"
    >
      {isAnimationComplete ? (
        <div className="relative flex overflow-hidden flex-col items-center justify-between h-full w-full p-4 gap-2">
          <div className="absolute top-0 left-0 right-0 bg-linear-to-r from-slate-600 to-slate-700 text-white p-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6">
                  <ChatBotLogo className="w-6 h-6" aria-hidden="true" />
                </div>
                <span id="chatbot-title" className="font-medium text-xs">
                  {t('title')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  aria-label={t('clearChat')}
                  className="text-xs bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span aria-hidden="true">🗑️</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseChatBot}
                  aria-label={t('closeChat')}
                  className="text-xs bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 p-1 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Cross1Icon aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label={t('messageHistory')}
            className="w-full h-full pt-12 pb-32 flex flex-col gap-3 overflow-y-auto scroll-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          >
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex flex-col gap-1 max-w-[85%]',
                  msg.role === 'assistant' ? 'self-start' : 'self-end'
                )}
              >
                <div
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm shadow-sm',
                    msg.role === 'assistant'
                      ? 'bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-linear-to-r from-slate-50 to-slate-100 text-gray-700 border border-slate-200'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: msg.message }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                  )}
                </div>
                <span className="text-xs text-gray-500 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {isLoading && (
              <div
                className="flex flex-col gap-1 self-start max-w-[85%]"
                role="status"
                aria-live="polite"
              >
                <div className="bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm">
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

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              <label htmlFor="chatbot-message" className="sr-only">
                {t('messageLabel')}
              </label>
              <Input
                id="chatbot-message"
                placeholder={t('placeholderMessage')}
                className="flex-1 text-sm"
                disabled={isLoading}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'chatbot-error' : undefined}
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
                aria-label={t('sendMessage')}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isLoading || !message.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 hover:shadow-md'
                )}
              >
                <span aria-hidden="true">{isLoading ? '⏳' : '📤'}</span>
              </button>
            </form>
            {errors.message && (
              <span id="chatbot-error" role="alert" className="text-xs text-red-500 mt-1">
                {errors.message.message}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <ChatBotLogo aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
