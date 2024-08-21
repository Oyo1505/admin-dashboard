import ButtonDeleteAccount from "@/components/ui/components/button-delete-account/button-delete-account";
import Title from "@/components/ui/components/title/title";
import whatsapp from '../../../../assets/image/WhatsAppButtonGreenSmall.svg'
import line  from '../../../../assets/image/LINE_Brand_icon.png'
import Image from "next/image";
import { InstagramLogo } from "@/components/ui/components/icons/icons";

export default async function SettingsPage() {
 
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <Title type='h1' translationTheme='DashboardNav' className="text-3xl"  translationText='settings' />
        </div>
        <div>
          <Title translationTheme="SettingsPage" type='h3' translationText='deleteAccount' />
          <ButtonDeleteAccount className='mt-4 bg-red-500 text-white' translationTheme="SettingsPage" translationText='deleteAccount' />
        </div>
        <div>
          <Title translationTheme="SettingsPage" type='h3' translationText='anyHelp' />
          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-start items-start">
              <a href=" https://ig.me/m/oyo1505" target="_blank" rel="noreferrer" className="flex h-11 w-48 sm:w-32 items-center justify-start gap-4">
              <button className="w-full h-full flex items-center justify-center group rounded-lg bg-white  group">
               <InstagramLogo />
                 <span className='text-sm text-background font-bold'>Oyo1505</span>
            </button>
             
            </a>
            <a aria-label="Chat on WhatsApp" href="https://wa.me/+33783067240" className="h-11 w-full sm:w-48"><Image  alt="Chat on WhatsApp" src={whatsapp} width="190" height="90" /></a>
            <a href="https://line.me/ti/p/Fhs7Qtfv-d" target="_blank">
              <Image src={line} alt="Contacter nous sur LINE" width="40" height="90" />
            </a>
            </div>
        </div>
      </main>
    );
  }
