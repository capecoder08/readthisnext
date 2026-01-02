import type { Book, TasteProfile, ReadingGoal } from "@/types";

export const mockTasteProfile: TasteProfile = {
  genres: [
    { name: "Mystery", percentage: 80 },
    { name: "Sci-Fi", percentage: 65 },
    { name: "Romance", percentage: 90 },
    { name: "Fantasy", percentage: 40 },
    { name: "Non-Fiction", percentage: 20 },
  ],
  tropes: [
    "Enemies to Lovers",
    "Found Family",
    "Slow Burn",
    "Whodunit",
  ],
};

export const mockReadingGoal: ReadingGoal = {
  target: 24,
  current: 12,
  year: 2025,
};

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Echo",
    author: "Elena Vance",
    coverImage: "/books/silent-echo.jpg",
    description:
      "In a town where the fog never lifts, a detective must solve a series of mysterious disappearances before she becomes the next victim.",
    matchPercentage: 94,
    isTrending: true,
    genres: ["Mystery", "Thriller"],
    tropes: ["Unreliable Narrator", "Atmospheric", "Small Town Secrets"],
  },
  {
    id: "2",
    title: "Starlight & Rust",
    author: "J.D. Salinger-Bot",
    coverImage: "/books/starlight-rust.jpg",
    description:
      "A scavenger finds a dormant AI in the wasteland and must decide whether to sell it or awaken it.",
    matchPercentage: 87,
    isTrending: false,
    genres: ["Sci-Fi", "Space Opera"],
    tropes: ["Philosophical", "Found Family", "Ancient Tech"],
  },
  {
    id: "3",
    title: "Garden of Secrets",
    author: "Clara Hawthorne",
    coverImage: "/books/garden-secrets.jpg",
    description:
      "Two lovers separated by war and class find solace in a hidden garden, only to discover secrets that could destroy them both.",
    matchPercentage: 72,
    isTrending: false,
    genres: ["Historical Fiction", "Romance"],
    tropes: ["Forbidden Love", "Drama", "Family Saga"],
  },
  {
    id: "4",
    title: "Coffee & Code",
    author: "Sarah Jenkins",
    coverImage: "/books/coffee-code.jpg",
    description:
      "A spilled latte and a merge conflict lead to an unexpected romance between two rival developers at a tech startup.",
    matchPercentage: 98,
    isTrending: true,
    genres: ["Romance", "Contemporary"],
    tropes: ["Enemies to Lovers", "Humor", "Workplace Romance"],
  },
  {
    id: "5",
    title: "The Last Lighthouse",
    author: "Marcus Webb",
    coverImage: "/books/last-lighthouse.jpg",
    description:
      "A lighthouse keeper's journal reveals a century of secrets, ghosts, and an impossible love that transcends time.",
    matchPercentage: 81,
    isTrending: false,
    genres: ["Gothic", "Mystery"],
    tropes: ["Dual Timeline", "Atmospheric", "Supernatural"],
  },
  {
    id: "6",
    title: "Neon Dragons",
    author: "Kim Tanaka",
    coverImage: "/books/neon-dragons.jpg",
    description:
      "In a cyberpunk Tokyo, a street artist discovers her murals can open portals to a realm of digital dragons.",
    matchPercentage: 76,
    isTrending: true,
    genres: ["Sci-Fi", "Fantasy"],
    tropes: ["Urban Fantasy", "Found Family", "Coming of Age"],
  },
  {
    id: "7",
    title: "Whispers in the Library",
    author: "Evelyn Cross",
    coverImage: "/books/whispers-library.jpg",
    description:
      "A rare books librarian stumbles upon a collection that whispers the futures of everyone who reads them.",
    matchPercentage: 89,
    isTrending: false,
    genres: ["Mystery", "Fantasy"],
    tropes: ["Cozy Mystery", "Magic Realism", "Book Within Book"],
  },
  {
    id: "8",
    title: "The Baker's Daughter",
    author: "Anna Moretti",
    coverImage: "/books/bakers-daughter.jpg",
    description:
      "Three generations of women, one family bakery, and the secret recipe that has been passed down for a century.",
    matchPercentage: 83,
    isTrending: false,
    genres: ["Women's Fiction", "Family Saga"],
    tropes: ["Multi-generational", "Foodie", "Found Family"],
  },
];
