'use client'
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Input } from "@/domains/ui/components/input/input";
import { Form, useForm } from "react-hook-form";
import { useLocale } from "next-intl";

const ChatBot = () => {
    const [isChatBotEnabled, setIsChatBotEnabled ] = useState(false)
    const [isAnimationComplete, setIsAnimationComplete] = useState(false)
    const locale = useLocale()
    const { register, handleSubmit, setValue, reset } = useForm({
      defaultValues: {
        language: locale,
        message: ""
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

    const onSubmit = (data: any) => {
        console.log(data)
        reset()
    }
    useEffect(() => {
      if(locale === "fr") {
        setValue("language", "fr")
      } else if(locale === "en") {
        setValue("language", "en")
      } else if(locale === "jp") {
        setValue("language", "jp")
      }
    }, [locale])

    return (
        <div onClick={() => !isChatBotEnabled && setIsChatBotEnabled(true)} onTransitionEnd={handleTransitionEnd} className={clsx("fixed bottom-10 z-20 right-10 w-20 h-20 text-black  bg-white shadow-lg transition-all duration-300 ease-in-out", isChatBotEnabled  ? "rounded-lg h-96 w-70" : " rounded-full w-20 h-20 hover:cursor-pointer")}>
          {isChatBotEnabled && isAnimationComplete ? (
           <div className="relative flex overflow-hidden flex-col items-center justify-between h-full w-full p-4">
            <div onClick={handleCloseChatBot} className="absolute top-2 z-30 right-2 flex flex-col items-center justify-center hover:cursor-pointer bg-red-400 w-8 h-8 rounded-full">X</div>
            <div className="w-full h-full pt-10 flex flex-col gap-2">
              <div className="w-fit h-auto self-start text-sm bg-amber-300 px-2 py-1 rounded-lg">
                Message from the chatbot
              </div>
              <div className="w-fit h-auto self-end text-sm bg-green-300 px-2 py-1 rounded-lg text-right">
                Message from the user
              </div>
            </div>
            <div className="w-full">
              <form  onSubmit={handleSubmit(onSubmit)} className="flex items-center justify-center">
                <Input placeholder="Votre message" className="w-full" {...register("message")} />
              </form>
            </div>
           </div>
          ) : null}
        </div>
    )
}

export default ChatBot;