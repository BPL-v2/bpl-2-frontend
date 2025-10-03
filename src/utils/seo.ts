// SEO configuration for different pages using vanilla DOM manipulation

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
}

export const updateSEO = (data: SEOData) => {
  // Update title
  document.title = data.title;

  // Update or create meta tags
  updateMetaTag("description", data.description);

  if (data.keywords) {
    updateMetaTag("keywords", data.keywords);
  }

  // Open Graph tags
  updateMetaProperty("og:title", data.title);
  updateMetaProperty("og:description", data.description);
  updateMetaProperty("og:type", data.type || "website");

  if (data.ogImage) {
    updateMetaProperty("og:image", data.ogImage);
  }

  if (data.canonicalUrl) {
    updateMetaProperty("og:url", data.canonicalUrl);
    updateCanonicalUrl(data.canonicalUrl);
  }

  // Twitter tags
  updateMetaProperty("twitter:title", data.title);
  updateMetaProperty("twitter:description", data.description);

  if (data.ogImage) {
    updateMetaProperty("twitter:image", data.ogImage);
  }
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.content = content;
};

const updateCanonicalUrl = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = url;
};

// Default SEO data for different routes
export const seoData = {
  home: {
    title: "BPL - Path of Exile Private League | Community Events",
    description:
      "Join BPL, a cooperative team-based Path of Exile community event where players compete to score points across multiple categories.",
    keywords:
      "Path of Exile, PoE, gaming competition, community event, team-based, ARPG, BPL, private league",
    canonicalUrl: "https://bpl-poe.com/",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  scores: {
    title: "BPL Leaderboard & Scoring | Path of Exile Competition Rankings",
    description:
      "View live BPL leaderboards, team rankings, and scoring across all Path of Exile competition categories.",
    keywords:
      "BPL leaderboard, Path of Exile rankings, PoE competition scores, team standings",
    canonicalUrl: "https://bpl-poe.com/scores/ladder",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  rules: {
    title: "BPL Rules & Guidelines | Path of Exile Competition Rules",
    description:
      "Complete BPL rules, scoring categories, and competition guidelines for the Path of Exile private league community event.",
    keywords:
      "BPL rules, Path of Exile competition rules, PoE event guidelines, scoring categories",
    canonicalUrl: "https://bpl-poe.com/rules",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  streams: {
    title: "BPL Live Streams | Watch Path of Exile Streams",
    description:
      "Watch live BPL streams from competing teams and players in the Path of Exile private league community event.",
    keywords:
      "BPL streams, Path of Exile live streams, PoE competition streaming, gaming streams",
    canonicalUrl: "https://bpl-poe.com/streams",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  settings: {
    title: "BPL Settings & Preferences | Account Configuration",
    description:
      "Manage your BPL account settings, preferences, and Path of Exile character connections.",
    keywords:
      "BPL settings, account preferences, PoE character linking, Oauth, Discord, Twitch, PoE",
    canonicalUrl: "https://bpl-poe.com/settings",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  submissions: {
    title: "BPL Submissions | Submit Your Progress",
    description:
      "Submit your Path of Exile bounties and boss kills for BPL scoring verification.",
    keywords: "BPL submissions, PoE bounty submission, boss kill verification",
    canonicalUrl: "https://bpl-poe.com/submissions",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
  profile: {
    title: "BPL Profile | View your event history",
    description:
      "View your current and past characters, their gear and your contributions for your team.",
    keywords: "BPL profile, Path of Building, PoB, character history",
    canonicalUrl: "https://bpl-poe.com/profile",
    ogImage: "https://bpl-poe.com/assets/app-logos/bpl-logo.webp",
  },
} as const;
