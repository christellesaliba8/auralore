'use client';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { Button } from './ui/button';
import { useAudio } from '@/providers/AudioProvider';

const LeftSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { audio } = useAudio();

  return (
    <section className="left_sidebar h-[calc(100vh-5px)] flex flex-col justify-between">
      {/* Logo and Sidebar Links (Scrollable Content Area) */}
      <div className="flex flex-col overflow-y-auto">
        <Link href="/" className="flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center">
          <Image src="/icons/logo-icon.png" alt="logo" width={23} height={27} />
          <h1 className="text-24 font-extrabold text-white max-lg:hidden">AuraLore</h1>
        </Link>

        <nav className="flex flex-col gap-6">
          {sidebarLinks.map(({ route, label, imgURL }) => {
            const isActive = pathname === route || pathname.startsWith(`${route}/`);

            return (
              <Link
                href={route}
                key={label}
                className={cn("flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start", {
                  'bg-nav-focus border-r-4 border-purple-1': isActive,
                })}
              >
                <Image src={imgURL} alt={label} width={24} height={24} />
                <p className="hidden lg:block">{label}</p> {/* Label visible only on larger screens */}
              </Link>
            );
          })}
        </nav>
      </div>  

      {/* Sign In / Log Out Button (Fixed at Bottom) */}
      <div className="mt-auto w-full">
        <SignedOut>
          <div className="flex-center w-full pb-6 px-4 lg:px-8">
            <Button asChild className="text-16 w-full bg-purple-1 font-extrabold hover:bg-purple-2">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex-center w-full pb-6 px-4 lg:px-8">
            <Button
              className="text-16 w-full bg-purple-1 font-extrabold hover:bg-purple-2"
              onClick={() => signOut(() => router.push('/'))}
            >
              Log Out
            </Button>
          </div>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;
