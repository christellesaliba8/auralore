"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import LoaderSpinner from '@/components/ui/LoaderSpinner'; // Assuming you have a LoaderSpinner component
import EmptyState from '@/components/EmptyState';

const PlaylistsPage = () => {
  const playlists = useQuery(api.playlists.getPlaylistsByUser);  // Fetch the playlists
  const createPlaylist = useMutation(api.playlists.createPlaylist);  // Mutation to create a playlist
  const deletePlaylist = useMutation(api.playlists.deletePlaylist);  // Mutation to delete a playlist
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const handleViewPlaylist = (playlistId, playlistName) => {
    router.push(`/playlists/${playlistId}?name=${encodeURIComponent(playlistName)}`);
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist({ playlistId });  // Call delete mutation
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (playlistName.trim()) {
      await createPlaylist({ playlistName });
      setPlaylistName('');
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8">
      <h1 className="text-20 font-bold text-white-1 mt-9">Your Playlists</h1>

      {/* Container for Playlists - flex with wrap and centered */}
      <div className="flex flex-wrap justify-center gap-4 w-full mx-auto">
        {playlists === undefined ? (  // Check if playlists data is undefined (loading)
          <LoaderSpinner />  // Display loader spinner while fetching data
        ) : (
          playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="w-full md:w-1/4  bg-black-2 rounded-lg p-4 flex flex-col gap-4 relative mt-3"
              >
                <h3 className="text-lg font-bold text-white-1">{playlist.playlistName}</h3>

                {/* Add an X button to delete the playlist */}
                <button
                  onClick={() => handleDeletePlaylist(playlist._id)}
                  className="absolute top-2 right-2 text-purple-1 font-bold"
                >
                  X
                </button>

                <button
  className="bg-purple-1 hover:bg-purple-2 text-white font-bold py-2 px-4 rounded mt-2 text-white-1"
  onClick={() => handleViewPlaylist(playlist._id, playlist.playlistName)}  // Pass playlistId and playlistName
>
  View Playlist
</button>
              </div>
            ))
          ) : (
           
            <EmptyState
              title="No Podcasts Found" 
              search={false} 
             
            />
          )
        )}
      </div>

      
      <button
        className="bg-purple-1 hover:bg-purple-2 text-white font-bold py-2 px-4 rounded mt-4  md:w-1/4 mx-auto mb-4  text-white-1"
        onClick={() => setShowForm(!showForm)}  // Toggle form visibility
      >
        {showForm ? 'Cancel' : 'Generate New Playlist'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 md:w-1/2 ml-60">
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="input-class focus-visible:ring-offset-purple-1 rounded-lg p-2"
           
          />

          <button
            type="submit"
            className="bg-purple-1 hover:bg-purple-2 text-white font-bold py-2 px-4 rounded text-white-1"
          >
            Generate Playlist
          </button>
        </form>
      )}
    </div>
  );
};

export default PlaylistsPage;
