import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import LoaderSpinner from "./ui/LoaderSpinner";
import Image from "next/image";

const CommentSection = ({ podcastId }) => {
  const { user, isSignedIn } = useUser(); // Get the logged-in user's information
  const [comment, setComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false); // State for toggling comments
  const [visibleDeleteButtons, setVisibleDeleteButtons] = useState({}); // State to track which comments have the delete button visible

  // Fetch the list of comments for this podcast (including the username and userClerkId)
  const comments = useQuery(api.comments.getCommentsByPodcastId, { podcastId });

  // Mutation to add a new comment
  const addComment = useMutation(api.comments.addComment);

  // Mutation to delete a comment
  const deleteComment = useMutation(api.comments.deleteComment);

  // Handle comment deletion
  const handleDelete = async (commentId) => {
    try {
      await deleteComment({
        commentId,
        userClerkId: user.id, // Pass the Clerk user ID to ensure ownership
      });
    } catch (error) {
      console.error("Error deleting comment", error);
    }
  };

  // Toggle visibility of the delete button for a comment
  const toggleDeleteButton = (commentId) => {
    setVisibleDeleteButtons((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle the visibility for the specific comment
    }));
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You need to be logged in to post a comment.");
      return;
    }

    if (comment.trim()) {
      await addComment({
        podcastId,
        text: comment,
        userClerkId: user.id, // Pass the Clerk user ID to the mutation
      });
      setComment("");
    }
  };

  // Render loading state while comments are being fetched
  if (!comments) return <LoaderSpinner />;

  // Get last 2 comments, or all if showAllComments is true
  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <div className="comment-section mt-8">
      <h2 className="text-20 font-bold text-white-1">Comments</h2>

      {/* List of existing comments */}
      <ul className="comments-list mt-4 space-y-4">
        {visibleComments.map((comment) => (
          <li key={comment._id} className="comment-item p-4 rounded bg-black-2 text-white relative text-white-1">
            <p>{comment.text}</p>
            <small className="text-gray-1">
              Posted by: {comment.username} <br />
              Posted at: {new Date(comment.timestamp).toLocaleString()}
            </small>

            {/* Three dots button to toggle delete button */}
            {user && user.id === comment.userClerkId && (
              <button
                className="absolute top-4 right-2 text-white hover:black-1"
                onClick={() => toggleDeleteButton(comment._id)}
              >
                <Image src="/icons/three-dots.svg" alt="three-dots" width={19} height={19} />
              </button>
            )}

            {/* Show delete button if the three-dots button is clicked */}
            {visibleDeleteButtons[comment._id] && (
              <button
                className="absolute top-10 right-2 bg-black-3 text-white p-1 rounded hover:bg-black-4 flex items-center gap-2"
                onClick={() => handleDelete(comment._id)}
              >
                <Image
                  src="/icons/delete.svg"
                  width={16}
                  height={16}
                  alt="Delete icon"
                />
                
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Button to toggle between last 2 comments and all comments */}
      {comments.length > 2 && (
        <button
          className="mt-4 text-purple-1"
          onClick={() => setShowAllComments(!showAllComments)}
        >
          {showAllComments ? "Show Less" : "Show All Comments"}
        </button>
      )}

      {/* Comment form to add a new comment */}
      {isSignedIn ? (
        <form onSubmit={handleCommentSubmit} className="mt-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded bg-black-3 text-white-1 placeholder:text-gray-1"
            rows={4}
            placeholder="Write a comment..."
          ></textarea>
          <button
            type="submit"
            className="mt-4 w-full bg-purple-1 text-white-1 py-2 rounded font-bold"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="text-white-3">You need to be logged in to post comments.</p>
      )}
    </div>
  );
};

export default CommentSection;
