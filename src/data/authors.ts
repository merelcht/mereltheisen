export interface Props {
  name: string;
  slug: string;
  image: string;
  bio: string;
}

export type Author = Props;

export const authors: Props[] = [
  {
    name: "Merel Theisen",
    slug: "merel-theisen",
    image: "./src/assets/authors/about-me.png",
    bio: "",
  }
];
