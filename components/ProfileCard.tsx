import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import LoaderSpinner from "./ui/LoaderSpinner";
import { useAudio } from "@/providers/AudioProvider";
import { PodcastProps, ProfileCardProps } from "@/types";
import { api } from "@/convex/_generated/api";

const ProfileCard = ({
  podcastData,
  imageUrl,
  userFirstName,
}: ProfileCardProps) => {
  const { setAudio } = useAudio();
  const [randomPodcast, setRandomPodcast] = useState<PodcastProps | null>(null);
  const incrementViews = useMutation(api.podcasts.updatePodcastViews); // Mutation to increment views

  const playRandomPodcast = async () => {
    const randomIndex = Math.floor(Math.random() * podcastData.podcasts.length);
    const selectedPodcast = podcastData.podcasts[randomIndex];

    try {
      // Increment views for the random podcast
      await incrementViews({ podcastId: selectedPodcast._id });
      
      // Play the random podcast
      setRandomPodcast(selectedPodcast);
    } catch (error) {
      console.error('Failed to increment views for random podcast:', error);
    }
  };

  useEffect(() => {
    if (randomPodcast) {
      setAudio({
        title: randomPodcast.podcastTitle,
        audioUrl: randomPodcast.audioUrl || "",
        imageUrl: randomPodcast.imageUrl || "",
        author: randomPodcast.author,
        podcastId: randomPodcast._id,
      });
    }
  }, [randomPodcast, setAudio]);

  if (!imageUrl) return <LoaderSpinner />;

  return (
    <div className="mt-6 flex flex-col gap-6 max-md:items-center md:flex-row">
      <Image
        src={imageUrl}
        width={250}
        height={250}
        alt="Podcaster"
        className="aspect-square rounded-lg"
      />
      <div className="flex flex-col justify-center max-md:items-center">
        <div className="flex flex-col gap-2.5">
          <figure className="flex gap-2 max-md:justify-center">
            <Image
              src="/icons/badge-check.svg"
              width={15}
              height={15}
              alt="verified"
            />
            <h2 className="text-14 font-medium text-white-2">
              Verified Creator
            </h2>
          </figure>
          <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
            {userFirstName}
          </h1>
        </div>
        <figure className="flex gap-3 py-6">
          <Image
            src="/icons/headphone.svg"
            width={24}
            height={24}
            alt="headphones"
          />
          <h2 className="text-16 font-semibold text-white-1">
            {podcastData?.listeners} &nbsp;
            <span className="font-normal text-white-2">monthly listeners</span>
          </h2>
        </figure>
        {podcastData?.podcasts.length > 0 && (
          <Button
            onClick={playRandomPodcast}
            className="text-16 bg-purple-1 font-extrabold text-white-1 hover:bg-purple-2"
          >
            <Image src="/icons/Play.svg" width={20} height={20} alt="play icon" />
            &nbsp; Play a random podcast
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
