// components/ViewPlaylist.tsx
"use client";  // Ensure it's a client component

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const ViewPlaylist = ({ playlistId }) => {
  const podcastsInPlaylist = useQuery(api.playlists.getPodcastsInPlaylist, { playlistId });

  if (!podcastsInPlaylist) return <p>Loading podcasts...</p>;

  return (
    <div>
      <h2>Podcasts in this Playlist</h2>
      {podcastsInPlaylist.length > 0 ? (
        podcastsInPlaylist.map(podcast => (
          <div key={podcast._id}>
            <h4>{podcast.podcastTitle}</h4>
            {/* Additional podcast details can go here */}
          </div>
        ))
      ) : (
        <p className="text-white-1 font-semibold">No podcasts added yet.</p>
      )}
    </div>
  );
};

export default ViewPlaylist;
