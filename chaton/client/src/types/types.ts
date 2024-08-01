export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface HomePageProps {}

export interface ProfileProps {
  user: { username: string; email: string };
}

export interface PostsProps {
  posts: Post[];
  currentUser: string | null;
}

export interface MyPostsProps {
  posts: Post[];
  currentUser: string;
  username: string;
  onPostCreated: (newPost: Post) => void;
  onDelete: (postId: string) => void;
  editingPost: Post | null;
  setEditingPost: React.Dispatch<React.SetStateAction<Post | null>>;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export interface CreatePostProps {
  userId: string;
  username: string;
  onPostCreated: (post: Post) => void;
}

export interface Message {
  id: string;
  content: string;
  senderUsername: string;
  receiverUsername: string;
  createdAt: string;
}

export interface ChatComponentProps {
  userUsername: string;
  userId: string;
}
