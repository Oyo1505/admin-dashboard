
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';

const VideoPlayer = dynamic(() => import('@/components/video-player'), { ssr: false })
export default async function IndexPage() {

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
        <Link href='dashboard'>dashboard</Link>
        <Suspense fallback={<p>Loading video...</p>}>
          <VideoPlayer option={{url: 'https://filesamples.com/samples/video/mkv/sample_1280x720_surfing_with_audio.mkv',}}
            style={{
                width: '600px',
                height: '400px',
                margin: '60px auto 0',
            }}
        //getInstance={(art) => console.info(art)}
          />
          
        </Suspense>
       
    </main>
  );
}
