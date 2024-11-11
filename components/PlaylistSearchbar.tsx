"use client";

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import Image from 'next/image';
import { useDebounce } from '@/lib/useDebounce';

const PlaylistSearchbar = ({ setSearch, searchPlaceholder = 'Search available podcasts!' }) => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedValue = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearch(debouncedValue);  // Set the search value for filtering podcasts in PlaylistCard
  }, [debouncedValue, setSearch]);

  return (
    <div className="relative mt-8 block">
      <Input
        className="input-class py-6 pl-12 focus-visible:ring-offset-purple-1"
        placeholder={searchPlaceholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <Image
        src="/icons/search.svg"
        alt="search"
        height={20}
        width={20}
        className="absolute left-4 top-3.5"
      />
    </div>
  );
};

export default PlaylistSearchbar;
