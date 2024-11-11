// components/Playlists.tsx
"use client";  // Make this a client component since it uses React hooks

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const Playlists = ({ setSelectedPlaylistId }) => {
  const playlists = useQuery(api.playlists.getPlaylistsByUser);  // Fetch user's playlists

  if (!playlists) return <p>Loading playlists...</p>;

  return (
    <div>
      <h2>Your Playlists</h2>
      {playlists.length > 0 ? (
        playlists.map(playlist => (
          <div key={playlist._id}>
            <h3>{playlist.playlistName}</h3>
            <button onClick={() => setSelectedPlaylistId(playlist._id)}>
              View Playlist
            </button>
          </div>
        ))
      ) : (
        <p>No playlists available</p>
      )}
    </div>
  );
};

export default Playlists;
