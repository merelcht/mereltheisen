import type { StaticImageData } from "astro:assets";
export interface Props {
  name: string;
  slug: string;
  image: StaticImageData;
  bio: string;
}

export type Author = Props;

import aboutMe from "../assets/authors/about-me.png";
export const authors: Props[] = [
  {
    name: "Merel Theisen",
    slug: "merel-theisen",
    image: aboutMe,
    bio: "",
  }
];
