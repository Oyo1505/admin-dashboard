import arteTv from "@/assets/image/ressourcePage/arte.jpg";
import franceTv from "@/assets/image/ressourcePage/francetv.png";
import tv5 from "@/assets/image/ressourcePage/tv5.png";
import youtube from "@/assets/image/ressourcePage/yt.avif";
import Ressources from "@/domains/ressources/components/ressources";
import Container from "@/domains/ui/components/container/container";
import Title from "@/domains/ui/components/title/title";

import { StaticImageData } from "next/image";

type Ressource = {
  id: number;
  name: string;
  url: string;
  description: string;
  image?: StaticImageData;
}

const webSitesRessources: Ressource[] = [
  {
    id: 1,
    name: "ArteTv",
    url: "https://www.arte.tv/fr/videos/cinema",
    description: "ArteTv",
    image: arteTv,
  },
  {
    id: 2,
    name: "FranceTv",
    url: "https://www.france.tv/films/",
    description: "FranceTv",
    image: franceTv,
  },
  {
    id: 3,
    name: "Cinematheque Henri Langlois",
    url: "https://www.cinematheque.fr/henri",
    description: "Cinematheque Henri Langlois",
  },
  {
    id: 4,
    name: "RareFilmm",
    url: "https://rarefilmm.com/",
    description: "RareFilmm",
  },
  {
    id: 5,
    name: "Rarelust",
    url: "https://rarelust.com/",
    description: "Rarelust",
  },
  {
    id: 6,
    name: "Archive.org",
    url: "https://archive.org/details/moviesandfilms",
    description: "Archive.org",
  },
  {
    id: 7,
    name: "TV5MondePlus",
    url: "https://www.tv5mondeplus.com/fr/cinema",
    description: "TV5MondePlus",
    image: tv5,
  },
  {
    id: 8,
    name: "TF1",
    url: "https://www.tf1.fr/programmes-tv/films",
    description: "TF1",
  },
  {
    id: 9,
    name: "Georgian Movies",
    url: "https://www.youtube.com/@georgianmovies5424",
    description: "Georgian Movies",
    image: youtube,
  },
];

const Page = () => {
  return <Container className="pt-14">
      <Title translationTheme="RessourcesPage" translationText="title" type="h1" className="mb-8 text-2xl font-bold" textColor="text-primary" />
      <Ressources listeRessources={webSitesRessources} />
    </Container>
};

export default Page;
