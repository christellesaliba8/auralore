"use client";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { useAudio } from "@/providers/AudioProvider";
import { PodcastDetailPlayerProps } from "@/types";

import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import LoaderSpinner from "./ui/LoaderSpinner";
import CommentSection from "@/components/CommentSection"; // Import the CommentSection component

const PodcastDetailPlayer = ({
  audioUrl,
  podcastTitle,
  author,
  imageUrl,
  podcastId,
  imageStorageId,
  audioStorageId,
  isOwner,
  authorImageUrl,
  authorId,
}: PodcastDetailPlayerProps) => {
  const router = useRouter();
  const { setAudio } = useAudio();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePodcast = useMutation(api.podcasts.deletePodcast);
  const incrementViews = useMutation(api.podcasts.updatePodcastViews); // Mutation to increment views

  const handleDelete = async () => {
    try {
      await deletePodcast({ podcastId, imageStorageId, audioStorageId });
      toast({
        title: "Podcast deleted",
      });
      router.push("/");
    } catch (error) {
      console.error("Error deleting podcast", error);
      toast({
        title: "Error deleting podcast",
        variant: "destructive",
      });
    }
  };

  const handlePlay = async () => {
    try {
      // Increment views
      await incrementViews({ podcastId });

      // Play the podcast
      setAudio({
        title: podcastTitle,
        audioUrl,
        imageUrl,
        author,
        podcastId,
      });
    } catch (error) {
      console.error("Failed to increment views:", error);
    }
  };

  const handleDownload = async () => {
    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = audioUrl;
      link.setAttribute("download", `${podcastTitle}.mp3`); // Set filename
      link.style.display = "none";
      document.body.appendChild(link);

      // Programmatically click the link to start the download
      link.click();

      // Clean up the anchor element after triggering the download
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Download failed",
        variant: "destructive",
      });
    }
  };

  if (!imageUrl || !authorImageUrl) return <LoaderSpinner />;

  return (
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
        {/* Image Section */}
        <div className="fixed-aspect-container">
          <Image
            src={imageUrl}
            width={250}
            height={250}
            alt="Podcast image"
            className="aspect-square rounded-lg"
            draggable="false" // Prevent image dragging
            style={{ objectFit: "cover", maxWidth: "250px", maxHeight: "250px" }} // Fix size and prevent stretching
          />
        </div>

        {/* Podcast Information and Buttons */}
        <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
          <article className="flex flex-col gap-2 max-md:items-center">
            <h1 className="text-32 font-extrabold tracking-[-0.32px] text-white-1">
              {podcastTitle}
            </h1>
            <figure
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                router.push(`/profile/${authorId}`);
              }}
            >
              <Image
                src={authorImageUrl}
                width={30}
                height={30}
                alt="Caster icon"
                className="size-[30px] rounded-full object-cover"
                draggable="false" // Prevent image dragging
              />
              <h2 className="text-16 font-normal text-white-3">{author}</h2>
            </figure>
          </article>

          {/* Play Button */}
          <Button
            onClick={handlePlay}
            className="text-16 w-full max-w-[250px] bg-purple-1 font-extrabold text-white-1"
          >
            <Image
              src="/icons/Play.svg"
              width={20}
              height={20}
              alt="random play"
            />{" "}
            &nbsp; Play podcast
          </Button>

          {/* Download Podcast Button Styled Like Play Button */}
          <Button
            onClick={handleDownload}
            className="text-16 w-full max-w-[250px] bg-purple-1 font-extrabold text-white-1 flex justify-center items-center gap-2 p-2 rounded-lg"
          >
            <Image
              src="/icons/down-arrow.png"
              width={20}
              height={20}
              alt="download icon"
            />
            &nbsp; Download
          </Button>
        </div>
      </div>
      {isOwner && (
        <div className="relative mt-2">
          <Image
            src="/icons/three-dots.svg"
            width={20}
            height={30}
            alt="Three dots icon"
            className="cursor-pointer"
            onClick={() => setIsDeleting((prev) => !prev)}
          />
          {isDeleting && (
            <div
              className="absolute -left-32 -top-2 z-10 flex w-32 cursor-pointer justify-center gap-2 rounded-md bg-black-6 py-1.5 hover:bg-black-2"
              onClick={handleDelete}
            >
              <Image
                src="/icons/delete.svg"
                width={16}
                height={16}
                alt="Delete icon"
              />
              <h2 className="text-16 font-normal text-white-1">Delete</h2>
            </div>
          )}
        </div>
      )}

      {/* Render Comment Section Here */}
      <CommentSection podcastId={podcastId} />
    </div>
  );
};

export default PodcastDetailPlayer;
