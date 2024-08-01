
import { useTranslations } from 'next-intl';
//import dynamic from 'next/dynamic';
import { Suspense } from 'react';

//const VideoPlayer = dynamic(() => import('@/components/shared/video-player'), { ssr: false })

export default function IndexPage() {
  const t = useTranslations('HomePage');
  // const session = await auth()
  // console.log(session)
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
        <Suspense fallback={<p>Loading video...</p>}>
          {/* <VideoPlayer option={{url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',}}
            style={{
                width: '600px',
                height: '400px',
                margin: '60px auto 0',
            }}
          /> */}
          {/* {session && 'tes'} */}
          <div>fdsf</div>
        </Suspense>
    </main>
  );
}
