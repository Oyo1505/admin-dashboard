
import LandingPage from '@/components/auth/components/landing-page/landing-page';
import { useTranslations } from 'next-intl';
//import dynamic from 'next/dynamic';
import { Suspense } from 'react';

//const VideoPlayer = dynamic(() => import('@/components/shared/video-player'), { ssr: false })

export default function IndexPage() {
  const t = useTranslations('HomePage');

  return (
    <main className="h-full">
        <Suspense fallback={<p>Loading video...</p>}>
          {/* <VideoPlayer option={{url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',}}
            style={{
                width: '600px',
                height: '400px',
                margin: '60px auto 0',
            }}
          /> */}
          {/* {session && 'tes'} */}
        </Suspense>
        <LandingPage />
    </main>
  );
}
