"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import PlaylistSearchbar from '@/components/PlaylistSearchbar';
import LoaderSpinner from '@/components/ui/LoaderSpinner'; // Assuming you have a LoaderSpinner component
import EmptyState from '@/components/EmptyState'; // Import the EmptyState component
import { useAudio } from '@/providers/AudioProvider'; // Import the AudioProvider to control audio

const PlaylistCard = () => {
  const { playlistId } = useParams(); // Get playlist ID from URL params
  const searchParams = useSearchParams();  // Get search params
  const playlistName = searchParams.get('name');  // Retrieve the playlist name from query params

  const router = useRouter();
  const { setAudio } = useAudio();  // Get the audio control functions from the AudioProvider

  const playlist = useQuery(api.playlists.getPodcastsInPlaylist, { playlistId }); // Get podcasts in the playlist
  const allPodcasts = useQuery(api.podcasts.getAllPodcasts);  // Fetch all podcasts
  const addPodcastToPlaylist = useMutation(api.playlists.addPodcastToPlaylist);  // Mutation to add podcast
  const removePodcastFromPlaylist = useMutation(api.playlists.removePodcastFromPlaylist);  // Mutation to remove podcast

  const [search, setSearch] = useState(''); // Search state for filtering

  const handlePlayPodcast = async (podcast) => {
    try {
      // Play the podcast using AudioProvider's setAudio function
      setAudio({
        title: podcast.podcastTitle,
        audioUrl: podcast.audioUrl,
        imageUrl: podcast.imageUrl,
        author: podcast.author,
        podcastId: podcast._id,
      });
    } catch (error) {
      console.error("Failed to play podcast", error);
    }
  };

  const handleAddPodcast = async (podcastId) => {
    try {
      await addPodcastToPlaylist({ playlistId, podcastId });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRemovePodcast = async (podcastId) => {
    try {
      await removePodcastFromPlaylist({ playlistId, podcastId });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Function to handle podcast page redirection when clicking on the image
  const handlePodcastClick = (podcastId) => {
    router.push(`/podcasts/${podcastId}`); // Navigate to the podcast's page
  };

  // Filter out podcasts that are already in the playlist
  const availablePodcasts = allPodcasts?.filter(
    (podcast) => !playlist?.some((p) => p._id === podcast._id)
  );

  // Filter podcasts based on search query (by title or author name)
  const filteredPodcasts = availablePodcasts?.filter((podcast) =>
    podcast.podcastTitle.toLowerCase().includes(search.toLowerCase()) ||
    podcast.author.toLowerCase().includes(search.toLowerCase()) // Include author (podcaster) in the search
  );

  // Check if data is loading or not fetched yet
  if (!playlist || !allPodcasts) {
    return <LoaderSpinner />;  // Display the loader while the data is being fetched
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Display the playlist name next to "Playlist" */}
      <h1 className="text-20 font-bold text-white-1 mt-9">
        Playlist {playlistName || 'Unnamed'} {/* Use the playlistName from query params */}
      </h1>

      {/* Display Podcasts in Playlist */}
      <div className="grid grid-cols-1 gap-0"> {/* Remove space between podcasts */}
        {playlist?.length > 0 ? (
          playlist.map((podcast) => (
            <div 
              key={podcast._id} 
              className="flex items-center justify-between p-4 hover:bg-black-2 bg-transparent transition-all duration-300 rounded"
            >
              <div className="flex items-center gap-4">
                {/* Clickable Image for Podcast Redirection */}
                <img
                  src={podcast.imageUrl}
                  alt={podcast.podcastTitle}
                  className="w-16 h-16 object-cover rounded cursor-pointer"
                  loading="lazy"
                  onClick={() => handlePodcastClick(podcast._id)} // Navigate to the podcast page when image is clicked
                />
                <div>
                  <h2 className="font-bold text-lg text-white-1 text-[20px]">{podcast.podcastTitle}</h2>
                  <p className="text-gray-1 text-[15px]">By {podcast.author}</p> {/* Display podcaster's name */}
                  <p className="text-gray-1 text-[15px]">{podcast.podcastDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-purple-1 hover:bg-purple-2 text-white-1 font-bold py-2 px-4 rounded-full"
                  onClick={() => handlePlayPodcast(podcast)} // Play podcast
                >
                  Play
                </button>
                <button
                  className="text-purple-1 font-bold px-4 hover:text-white-1"
                  onClick={() => handleRemovePodcast(podcast._id)} // Remove podcast from playlist
                >
                  X
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No Podcasts Found" search={false} />
        )}
      </div>

      {/* Use PlaylistSearchbar for filtering available podcasts */}
      <PlaylistSearchbar setSearch={setSearch} />

      {/* Display Available Podcasts to Add */}
      <h2 className="text-xl font-bold text-white-1">Add Podcasts</h2>
      <div className="grid grid-cols-1 gap-0"> {/* Remove space between podcasts */}
        {filteredPodcasts?.length > 0 ? (
          filteredPodcasts.map((podcast) => (
            <div 
              key={podcast._id} 
              className="flex items-center justify-between p-4 hover:bg-black-2 bg-transparent transition-all duration-300 rounded"
            >
              <div className="flex items-center gap-4">
                {/* Clickable Image for Podcast Redirection */}
                <img
                  src={podcast.imageUrl}
                  alt={podcast.podcastTitle}
                  className="w-16 h-16 object-cover rounded cursor-pointer"
                  loading="lazy"
                  onClick={() => handlePodcastClick(podcast._id)} // Navigate to the podcast page when image is clicked
                />
                <div>
                  <h2 className="font-bold text-lg text-white-1 text-[20px]">{podcast.podcastTitle}</h2>
                  <p className="text-gray-1 text-[15px]">By {podcast.author}</p> {/* Display podcaster's name */}
                  <p className="text-gray-1 text-[15px]">{podcast.podcastDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Play Button */}
                <button
                  className="bg-purple-1 hover:bg-purple-2 text-white-1 font-bold py-2 px-4 rounded-full"
                  onClick={() => handlePlayPodcast(podcast)} // Play podcast
                >
                  Play
                </button>
                {/* Add Button */}
                <button
                  className="bg-green-1 hover:bg-green-2 text-purple-1 font-bold py-2 px-4 rounded-full hover:text-white-1"
                  onClick={() => handleAddPodcast(podcast._id)} // Add podcast to playlist
                >
                  Add
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white-1 font-semibold">No podcasts available to add.</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;
