import { useState, useCallback } from "react";
import axios from "axios";
import { Comment } from "../types/types";

export const useComments = (initialComments: Record<string, Comment[]> = {}) => {
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>(initialComments);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>("");

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const response = await axios.get<{ comments: Comment[] }>(`/api/comments/${postId}/comments`);
      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data.comments || [],
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, []);

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const response = await axios.post<{ comment: Comment }>(`/api/comments/${postId}/comments`, {
        content,
      });
      const newComment = response.data.comment;
      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment],
      }));
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: (prevComments[postId] || []).filter((comment) => comment.id !== commentId),
      }));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleEditComment = async (postId: string, commentId: string) => {
    try {
      const response = await axios.put<{ comment: Comment }>(`/api/comments/${commentId}`, {
        content: editCommentContent,
      });
      const updatedComment = response.data.comment;

      setPostComments((prevComments) => ({
        ...prevComments,
        [postId]: (prevComments[postId] || []).map((comment) =>
          comment.id === updatedComment.id
            ? { ...comment, content: updatedComment.content }
            : comment
        ),
      }));

      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      console.error("Failed to edit comment", err);
    }
  };

  const handleEditButtonClick = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  return {
    postComments,
    editingCommentId,
    editCommentContent,
    fetchComments,
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    handleEditButtonClick,
    cancelEdit,
    setEditCommentContent,
  };
};
