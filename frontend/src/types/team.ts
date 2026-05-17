export type TeamRef = { id: number; name: string; logo: string };
export type League = { id: number; name: string; logo: string; season: number };
export type Venue = { name: string; city: string; capacity?: number };
export type Team = {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded?: number;
  venue?: Venue;
  league?: League;
};
