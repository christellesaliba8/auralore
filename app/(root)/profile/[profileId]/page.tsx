"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import PodcastCard from "@/components/PodcastCard";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/convex/_generated/api";
import LoaderSpinner from "@/components/ui/LoaderSpinner";
import Modal from "@/components/Modal";
 // Import a Modal component (you'll need to create this)

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const user = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });
  const podcastsData = useQuery(api.podcasts.getPodcastByAuthorId, {
    authorId: params.profileId,
  });

  const incrementViews = useMutation(api.podcasts.updatePodcastViews); // Mutation to increment views
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  if (!user || !podcastsData) return <LoaderSpinner />;

  const playRandomPodcast = async () => {
    const randomIndex = Math.floor(Math.random() * podcastsData.podcasts.length);
    const randomPodcast = podcastsData.podcasts[randomIndex];

    try {
      // Increment views for the random podcast
      await incrementViews({ podcastId: randomPodcast._id });
      // Logic to play the random podcast
      console.log(`Playing random podcast: ${randomPodcast.podcastTitle}`);
    } catch (error) {
      console.error('Failed to play random podcast:', error);
    }
  };

  // Function to toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-20 font-bold text-white-1 max-md:text-center">
        Podcaster Profile
      </h1>
      <div className="mt-6 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          podcastData={podcastsData!}
          imageUrl={user?.imageUrl!}
          userFirstName={user?.name!}
          userLastName={user?.name!}
        />
      </div>

      {/* All Podcasts Section */}
      <section className="mt-9 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
          {/* See All button */}
          <button
            onClick={toggleModal}
            className="text-16 text-purple-1 hover:text-purple-2 font-bold"
          >
            See All
          </button>
        </div>

        {podcastsData && podcastsData.podcasts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Display only the first 4 podcasts */}
            {podcastsData?.podcasts
              ?.slice(0, 4)
              .map((podcast) => (
                <PodcastCard
                  key={podcast._id}
                  imgUrl={podcast.imageUrl!}
                  title={podcast.podcastTitle!}
                  description={podcast.podcastDescription}
                  podcastId={podcast._id}
                />
              ))}
          </div>
        ) : (
          <EmptyState
            title="You have not created any podcasts yet"
            buttonLink="/create-podcast"
            buttonText="Create Podcast"
          />
        )}

        {/* Modal for showing all podcasts */}
   {/* Modal for showing all podcasts */}
{isModalOpen && (
  <Modal onClose={toggleModal}>
    <div className="p-6">
      <h2 className="text-24 font-bold text-white-1 mb-4">All Podcasts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {podcastsData?.podcasts.map((podcast) => (
          <PodcastCard
            key={podcast._id}
            imgUrl={podcast.imageUrl!}
            title={podcast.podcastTitle!}
            description={podcast.podcastDescription}
            podcastId={podcast._id}
          />
        ))}
      </div>
    </div>
  </Modal>
)}

      </section>
    </section>
  );
};

export default ProfilePage;
