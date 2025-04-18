'use client'
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { Input } from "@/domains/ui/components/input/input";
import {  useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { threadChatBot } from "../mistral.action";
import { useQuery } from "@tanstack/react-query";
import { ChatBotLogo } from "@/domains/ui/components/icons/icons";
import { useTranslations } from "next-intl";
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';
import { usePathname } from "next/navigation";
const ChatBot = () => {
    const t = useTranslations("ChatBot")
    const [isChatBotEnabled, setIsChatBotEnabled ] = useState(false);
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);
    const [messages, setMessages] = useState<{role: string, message: string}[]>([{role: 'assistant', message: t("placeholder")}])
    const locale = useLocale();
    const pathname = usePathname();
    const messagesEndRef = useRef<HTMLDivElement>(null);
   
    const { register, handleSubmit, reset, watch  } = useForm({
      defaultValues: {
        message: ""
      }
    })
    const message = watch("message")
    
    const  {isLoading, error, refetch} = useQuery({
      queryKey: ['chatBot'],
      enabled: false,
      queryFn: async () => {
        const response = await threadChatBot(message, locale)
        setMessages(prev => [...prev, {role: 'assistant', message: response.answer}])
        return response
      }
    })
    
    const handleTransitionEnd = () => {
      if (isChatBotEnabled) {
        setIsAnimationComplete(true)
      } else {
        setIsAnimationComplete(false)
      }
    }

    const handleCloseChatBot = () => {
        setIsChatBotEnabled(false)
    }

    const onSubmit = async (data: any) => {
      try {
        setMessages(prev => [...prev, {role: 'user', message: data.message}])
        refetch()
        reset()
      } catch (error) {
        console.error(error)
      }
    }

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if(pathname === "/") return null
    
    return (
        <div onClick={() => !isChatBotEnabled && setIsChatBotEnabled(true)} onTransitionEnd={handleTransitionEnd} className={clsx("fixed bottom-10 z-20 right-10 w-20 h-20 text-black  bg-white shadow-lg transition-all duration-300 ease-in-out", isChatBotEnabled  ? "rounded-lg h-96 w-90" : " rounded-full w-20 h-20 hover:cursor-pointer")}>
          {isChatBotEnabled && isAnimationComplete ? (
           <div className="relative flex overflow-hidden flex-col items-center justify-between h-full w-full p-4 gap-1">
            <div onClick={handleCloseChatBot} className="absolute top-2 z-30  right-2 flex flex-col gap-2 items-center justify-center hover:cursor-pointer bg-red-400 w-8 h-8 rounded-full">X</div>
            <div className="w-full h-full pt-10 flex flex-col gap-2 overflow-y-auto scroll-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {messages.map((message: {role: string, message: string}, index: number) => (
                <div key={index} className={clsx(message.role === 'assistant' ? "self-start text-sm bg-amber-300 px-2 py-1 rounded-lg text-left" : "w-fit h-auto self-end text-sm bg-green-300 px-2 py-1 rounded-lg text-left")}>
                  {message.role === 'assistant' ? <div className="w-fit h-auto" dangerouslySetInnerHTML={{ __html: message.message }} /> : message.message}
                </div>
              ))}
              {isLoading && <div className="w-fit h-auto self-start items-end text-sm px-2 py-1 rounded-xl text-left"><LoadingSpinner /></div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="w-full">
              <form  onSubmit={handleSubmit(onSubmit)} className="flex items-center justify-center gap-2 flex-wrap">
                <Input placeholder={ error?.message ? error?.message : t("placeholderMessage")} className="w-full" {...register("message", {required: true})} />
                <button type="submit" className="w-10 h-10">{t("send")}</button>
              </form>
            </div>
           </div>
          ) : <ChatBotLogo />}
        </div>
    )
}

export default ChatBot;