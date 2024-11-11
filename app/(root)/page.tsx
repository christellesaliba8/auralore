"use client";
import PodcastCard from '@/components/PodcastCard';
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAudio } from "@/providers/AudioProvider"; // Use the AudioProvider for play functionality
import { api } from '@/convex/_generated/api';
import { useToast } from "@/hooks/use-toast"; // Assuming you use toast notifications
import LoaderSpinner from '@/components/ui/LoaderSpinner'; // Import the LoaderSpinner component

const Home = () => {
  const [sponsoredPodcast, setSponsoredPodcast] = useState(null);
  const router = useRouter(); // Initialize the router
  const { setAudio } = useAudio(); // Get the audio control functions
  const { toast } = useToast(); // To show toast notifications

  // Fetch trending podcasts and all podcasts
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);
  const allPodcasts = useQuery(api.podcasts.getAllPodcasts);

  // Mutation to increment views
  const incrementViews = useMutation(api.podcasts.updatePodcastViews);

  // Select a random podcast for "Sponsored" section ONLY on the initial load
  useEffect(() => {
    if (allPodcasts && allPodcasts.length > 0 && !sponsoredPodcast) {
      // If no sponsored podcast is set, select one randomly
      const randomIndex = Math.floor(Math.random() * allPodcasts.length);
      setSponsoredPodcast(allPodcasts[randomIndex]);
    }
  }, [allPodcasts, sponsoredPodcast]); // Only run on initial load or if podcasts list changes

  // Handle playing the sponsored podcast
  const handlePlay = async () => {
    if (sponsoredPodcast) {
      try {
        // Increment the view count for the sponsored podcast
        await incrementViews({ podcastId: sponsoredPodcast._id });

        // Play the podcast using AudioProvider
        setAudio({
          title: sponsoredPodcast.podcastTitle,
          audioUrl: sponsoredPodcast.audioUrl,
          imageUrl: sponsoredPodcast.imageUrl,
          author: sponsoredPodcast.author,
          podcastId: sponsoredPodcast._id,
        });

      } catch (error) {
        console.error("Failed to play podcast", error);
        toast({
          title: "Failed to play podcast",
          variant: "destructive",
        });
      }
    }
  };

  // Handle loading state by showing LoaderSpinner if the data is still loading
  if (!trendingPodcasts || !allPodcasts) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderSpinner /> {/* Display the loader spinner while fetching data */}
      </div>
    );
  }

  return (
    <div className="mt-9 flex flex-col gap-9 md:overflow-hidden">

      {/* Sponsored Podcast Section */}
      {sponsoredPodcast && (
        <section className="flex flex-col bg-gradient-to-r from-black-3 to-black-2 p-6 rounded-lg mb-6">
          <h1 className="text-20 font-bold text-white-1 mb-5">Sponsored Podcast</h1>
          <div className="flex items-start">
            {/* Podcast Image */}
            <div
              className="relative w-40 h-40 flex-shrink-0 cursor-pointer"
              onClick={() => router.push(`/podcasts/${sponsoredPodcast._id}`)} // Navigate to podcast page
            >
              <Image
                src={sponsoredPodcast.imageUrl}
                alt={sponsoredPodcast.podcastTitle}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            {/* Podcast Info */}
            <div className="ml-6">
              <h2 className="text-white-1 text-2xl font-bold">
                {sponsoredPodcast.podcastTitle}
              </h2>
              <p className="text-gray-1 text-sm pt-1">by {sponsoredPodcast.author}</p>
              <p className="text-gray-1 mb-4 pt-1">{sponsoredPodcast.podcastDescription}</p>
              <button
                onClick={handlePlay}
                className="bg-purple-1 hover:bg-purple-2 text-white-1 font-bold py-2 px-4 rounded-full mr-4"
              >
                Play
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Trending Podcasts Section */}
      <section className="flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">Trending Podcasts</h1>
        <div className="podcast_grid">
          {trendingPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
            <PodcastCard
              key={_id}
              imgUrl={imageUrl}
              title={podcastTitle}
              description={podcastDescription}
              podcastId={_id}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
