'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";
import { Progress } from "./ui/progress";

const PodcastPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerVisible, setPlayerVisible] = useState(true);
  const { audio, isPlaying, setIsPlaying } = useAudio();

  const togglePlayPause = () => {
    if (audioRef.current?.paused) {
      audioRef.current?.play();
      setIsPlayingLocal(true);
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlayingLocal(false);
      setIsPlaying(false);
      setShowCloseButton(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted((prev) => !prev);
    }
  };

  const forward = () => {
    if (audioRef.current && audioRef.current.currentTime + 5 < audioRef.current.duration) {
      audioRef.current.currentTime += 5;
    }
  };

  const rewind = () => {
    if (audioRef.current && audioRef.current.currentTime - 5 > 0) {
      audioRef.current.currentTime -= 5;
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleClosePlayer = () => {
    setPlayerVisible(false);
    setIsPlayingLocal(false);
    setIsPlaying(false);
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const audioElement = audioRef.current;
    audioElement?.addEventListener("timeupdate", updateCurrentTime);

    return () => audioElement?.removeEventListener("timeupdate", updateCurrentTime);
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audio?.audioUrl) {
      setPlayerVisible(true);
      audioElement?.play().then(() => {
        setIsPlayingLocal(true);
        setIsPlaying(true);
      });
    } else {
      audioElement?.pause();
      setIsPlayingLocal(false);
      setIsPlaying(false);
    }
  }, [audio, setIsPlaying]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlayingLocal(false);
    setIsPlaying(false);
    setTimeout(() => setPlayerVisible(false), 500);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full flex flex-col transition-transform duration-500",
        {
          hidden: !audio?.audioUrl,
          "translate-y-0": playerVisible,
          "translate-y-full": !playerVisible,
        }
      )}
    >
      <Progress value={(currentTime / duration) * 100} className="w-full" max={duration} />
      <section className="glassmorphism-black flex h-[112px] w-full items-center justify-between px-4 max-md:justify-center md:px-12">
        <audio
          ref={audioRef}
          src={audio?.audioUrl}
          className="hidden"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
        <div className="flex items-center gap-2 max-md:hidden">
          <Link href={`/podcasts/${audio?.podcastId}`}>
            <Image src={audio?.imageUrl || "/images/player1.png"} width={64} height={64} alt="player1" className="aspect-square rounded-xl" />
          </Link>
          <div className="flex flex-col">
            <h2 className="text-14 truncate font-semibold text-white-1">{audio?.title}</h2>
            <p className="text-12 font-normal text-white-2">{audio?.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-12 font-normal text-white-2">{formatTime(currentTime)}</span>
            <Image src="/icons/reverse.svg" width={24} height={24} alt="rewind" onClick={rewind} />
            <h2 className="text-12 font-bold text-white-4">-5</h2>
          </div>
          <Image src={isPlayingLocal ? "/icons/Pause.svg" : "/icons/Play.svg"} width={30} height={30} alt="play" onClick={togglePlayPause} />
          <div className="flex items-center gap-1.5">
            <h2 className="text-12 font-bold text-white-4">+5</h2>
            <Image src="/icons/forward.svg" width={24} height={24} alt="forward" onClick={forward} />
            <span className="text-12 font-normal text-white-2">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume and Conditional Close Button */}
        <div className="flex items-center gap-6">
          <Image
            src={isMuted ? "/icons/unmute.svg" : "/icons/mute.svg"}
            width={24}
            height={24}
            alt="mute"
            onClick={toggleMute}
            className="cursor-pointer"
          />
          {/* Conditional close button with hover effect */}
          {showCloseButton && (
            <Image
              src="/icons/close (1).png" 
              width={22}
              height={22}
              alt="close"
              onClick={handleClosePlayer}
              className="cursor-pointer hover:filter hover:brightness-200" 
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default PodcastPlayer;
