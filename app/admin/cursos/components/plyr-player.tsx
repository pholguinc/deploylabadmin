"use client";

import { useEffect, useMemo, useRef } from "react";
import "plyr/dist/plyr.css";

function getYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("vimeo.com")) {
      const match = parsedUrl.pathname.match(/\/([0-9]+)/);
      return match ? match[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

const PLYR_OPTIONS: Plyr.Options = {
  autoplay: false,
  controls: [
    "play-large",
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "captions",
    "settings",
    "pip",
    "airplay",
    "fullscreen",
  ],
  youtube: {
    noCookie: true,
    rel: 0,
    showinfo: 0,
    iv_load_policy: 3,
    modestbranding: 1,
  },
};

export default function PlyrPlayer({ videoUrl }: { videoUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);

  const source: Plyr.SourceInfo = useMemo(() => {
    if (youtubeId) {
      return {
        type: "video" as const,
        sources: [{ src: youtubeId, provider: "youtube" as const }],
      };
    }
    if (vimeoId) {
      return {
        type: "video" as const,
        sources: [{ src: vimeoId, provider: "vimeo" as const }],
      };
    }
    return {
      type: "video" as const,
      sources: [{ src: videoUrl, type: "video/mp4" }],
    };
  }, [youtubeId, vimeoId, videoUrl]);

  useEffect(() => {
    let plyr: Plyr | null = null;
    let isCancelled = false;

    const init = async () => {
      if (!containerRef.current) return;

      // Dynamically import plyr only on the client
      const PlyrClass = (await import("plyr")).default;
      
      if (isCancelled || !containerRef.current) return;

      containerRef.current.innerHTML = "";
      const videoEl = document.createElement("video");
      containerRef.current.appendChild(videoEl);

      plyr = new PlyrClass(videoEl, PLYR_OPTIONS);
      plyr.source = source;
      playerRef.current = plyr;
    };

    init();

    return () => {
      isCancelled = true;
      if (plyr) {
        plyr.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      playerRef.current = null;
    };
  }, [source]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden bg-black"
    />
  );
}
