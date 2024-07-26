"use client"
import ReactPlayer from 'react-player'
import Artplayer from 'artplayer';
import { useEffect, useRef, useState } from 'react';
type Props = {
  src?:string
  subtitles?:string
  option?: any
  getInstance?:any
  style: {
    width: string;
    height: string;
    margin: string;
  };
}


const VideoPlayer = ({ option, getInstance, ...rest }:Props) => {
  const artRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
      const art = new Artplayer({
          ...option,
          container: artRef.current,
          volume: 0.5,
          isLive: false,
          muted: false,
          autoplay: false,
          pip: true,
          autoSize: true,
          autoMini: true,
          screenshot: true,
          setting: true,
          loop: false,
          flip: false,
          playbackRate: false,
          aspectRatio: true,
          fullscreen: true,
          fullscreenWeb: true,
          subtitleOffset: true,
          miniProgressBar: true,
          mutex: true,
          backdrop: false,
          playsInline: false,
          autoPlayback: false,
          airplay: true,
          settings: [
          {
              width: 200,
              html: 'Subtitle',
              tooltip: 'Bilingual',
              icon: '<img width="22" heigth="22" src="/assets/img/subtitle.svg">',
              selector: [
                  {
                      html: 'Display',
                      tooltip: 'Show',
                      switch: true,
                      onSwitch: function (item) {
                          item.tooltip = item.switch ? 'Hide' : 'Show';
                          art.subtitle.show = !item.switch;
                          return !item.switch;
                      },
                  },
                  {
                      default: true,
                      html: 'Bilingual',
                      url: 'https://gist.githubusercontent.com/matibzurovski/d690d5c14acbaa399e7f0829f9d6888e/raw/63578ca30e7430be1fa4942d4d8dd599f78151c7/example.srt',
                  },
                  {
                      html: 'Chinese',
                      url: 'https://gist.githubusercontent.com/matibzurovski/d690d5c14acbaa399e7f0829f9d6888e/raw/63578ca30e7430be1fa4942d4d8dd599f78151c7/example.srt',
                  },
              ],
              onSelect: function (item) {
                  art.subtitle.switch(item.url, {
                      name: item.html,
                  });
                  return item.html;
              },
          },
          {
              html: 'Switcher',
              icon: '<img width="22" heigth="22" src="/assets/img/state.svg">',
              tooltip: 'OFF',
              switch: false,
              onSwitch: function (item) {
                  item.tooltip = item.switch ? 'OFF' : 'ON';
                  console.info('You clicked on the custom switch', item.switch);
                  return !item.switch;
              },
          },
          {
              html: 'Slider',
              icon: '<img width="22" heigth="22" src="/assets/img/state.svg">',
              tooltip: '5x',
              range: [5, 1, 10, 0.1],
              onRange: function (item) {
                  return item.range + 'x';
              },
          },
      ],    
      });
      setTimeout(() => {
        art.url = option.url;
    }, 1000);
    console.log(art)
      return () => {
          if (art && art.destroy) {
              art.destroy(false);
          }
      };
  }, [option]);

  const videoConfig = {
    file: {
      attributes: { crossOrigin: 'anonymous' },
      tracks: [
        {
          default: true,
          kind: 'captions',
          srcLang: 'en',
          src:'https://gist.githubusercontent.com/matibzurovski/d690d5c14acbaa399e7f0829f9d6888e/raw/63578ca30e7430be1fa4942d4d8dd599f78151c7/example.srt',
          label: 'English',
          mode: 'showing',
        },
      ],
    },
  };

  return (
    <div>
      <ReactPlayer 
      controls 
      url={[{src:'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'}]} 
      config={videoConfig}
      />

      mkv
      <div ref={artRef} {...rest} />
 
    </div>
  );
};

export default VideoPlayer;