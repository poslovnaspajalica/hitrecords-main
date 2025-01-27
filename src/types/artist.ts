export interface Artist {
  id: number;
  name: string;
  image: string;
  bio: string;
  genres: string[];
  country: string;
  social: {
    spotify?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  releases: number[];
} 