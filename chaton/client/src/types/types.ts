export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
}

export interface HomePageProps {}

export interface ProfileProps {
  user: {
    id: string;
    username: string;
    email: string;
    location?: string;
    bio?: string;
    profilePicture?: string;
  };
}

export interface CommunityPostsProps {
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

export interface ChatProps {
  userUsername: string;
  userId: string;
}

export interface FollowProps {
  userId: string;
}

export interface FollowersPostsProps {
  userId: string;
  currentUser: User | null;
}
