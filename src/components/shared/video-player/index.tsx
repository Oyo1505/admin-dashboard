"use client"
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
          muted: false,
          autoplay: false,
          autoSize: true,
          autoMini: true,
          screenshot: true,
          setting: true,
          playbackRate: false,
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
      ],    
      });
      setTimeout(() => {
        art.url = option.url;
    }, 1000);

      return () => {
          if (art && art.destroy) {
              art.destroy(false);
          }
      };
  }, [option]);

  return (
    <div>
      <div ref={artRef} {...rest} />
    </div>
  );
};

export default VideoPlayer;