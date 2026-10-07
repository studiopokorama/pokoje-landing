const CDN_BASE_URL = "https://cdn.pokorama.com/demo";
const CATALOG_PATH = "catalog.json";

type CatalogLinks = Record<string, string>;
type CatalogResponse = { links?: CatalogLinks; landingLinks?: CatalogLinks };
export type ActionPlatform =
  | "facebook"
  | "instagram"
  | "pinterest"
  | "tiktok"
  | "youtube";

export type CatalogActionLink = {
  href: string;
  label: string;
  platform: ActionPlatform;
};

export type LandingLinks = {
  demo?: string;
  steam?: string;
  ios?: string;
  android?: string;
  socials: CatalogActionLink[];
};

const resolveSocialPlatform = (key: string): ActionPlatform | null => {
  const normalizedKey = key.toLowerCase();

  if (!normalizedKey.startsWith("social")) return null;
  // The landing links to pages only, not community groups.
  if (normalizedKey.includes("group")) return null;
  if (normalizedKey.includes("facebook")) return "facebook";
  if (normalizedKey.includes("instagram")) return "instagram";
  if (
    normalizedKey.includes("pinterest") ||
    normalizedKey.includes("pintterest")
  ) {
    return "pinterest";
  }
  if (normalizedKey.includes("tiktok")) return "tiktok";
  if (normalizedKey.includes("youtube")) return "youtube";

  return null;
};

const formatActionLabel = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getDefaultPlatformLabel = (platform: ActionPlatform) => {
  switch (platform) {
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "pinterest":
      return "Pinterest";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
  }
};

const getSocialActionLabel = (key: string, platform: ActionPlatform) => {
  const strippedKey = key.replace(/^social/i, "");
  const withoutPlatform = strippedKey
    .replace(/facebook/i, "")
    .replace(/instagram/i, "")
    .replace(/pinterest/i, "")
    .replace(/pintterest/i, "")
    .replace(/tiktok/i, "")
    .replace(/youtube/i, "");
  const label = formatActionLabel(withoutPlatform);

  return label || getDefaultPlatformLabel(platform);
};

export const getCatalogUrl = () => `${CDN_BASE_URL}/${CATALOG_PATH}`;

export const resolveCdnAssetUrl = (assetPath: string) =>
  `${CDN_BASE_URL}/${assetPath.replace(/^\/+/, "")}`;

export const resolveBackgroundImageUrl = (tier: "low" | "mid" | "high") =>
  `${CDN_BASE_URL}/${tier}/raster/splash_screens/splash_01.webp`;

export const fetchLandingLinks = async (): Promise<LandingLinks> => {
  const response = await fetch(getCatalogUrl());
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  const json = (await response.json()) as CatalogResponse;
  const links = json.links ?? {};
  const landingLinks = json.landingLinks ?? {};
  const socials: CatalogActionLink[] = [];

  for (const [key, href] of Object.entries(links)) {
    const platform = resolveSocialPlatform(key);
    if (!platform) continue;

    socials.push({
      href,
      label: getSocialActionLabel(key, platform),
      platform,
    });
  }

  return {
    demo: landingLinks.listingWeb,
    steam: links.steamWishlist,
    ios: landingLinks.listingIos,
    android: landingLinks.listingAndroid,
    socials,
  };
};
