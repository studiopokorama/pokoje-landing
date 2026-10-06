const CDN_BASE_URL = "https://cdn.pokorama.com/demo";
const CATALOG_PATH = "catalog.json";

type CatalogLinks = Record<string, string>;
type CatalogResponse = { links?: CatalogLinks };
export type ActionPlatform =
  | "steamWishlist"
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

const getFirstMatchingLink = (links: CatalogLinks, requiredTerms: string[]) => {
  return Object.entries(links).find(([key]) => {
    const lowerKey = key.toLowerCase();
    return requiredTerms.every((term) => lowerKey.includes(term));
  })?.[1];
};

const getLinkByKey = (links: CatalogLinks, key: string) =>
  Object.entries(links).find(
    ([linkKey]) => linkKey.toLowerCase() === key.toLowerCase(),
  )?.[1];

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
    case "steamWishlist":
      return "Steam";
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

export const fetchStoreLinks = async () => {
  const response = await fetch(getCatalogUrl());
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  const json = (await response.json()) as CatalogResponse;
  const links = json.links ?? {};

  const ios =
    links.completeAppIos ??
    links.completeAppIOS ??
    getFirstMatchingLink(links, ["completeapp", "ios"]);

  const android =
    links.completeAppAndroid ??
    getFirstMatchingLink(links, ["completeapp", "android"]);

  return { ios, android };
};

export const fetchActionLinks = async (): Promise<CatalogActionLink[]> => {
  const response = await fetch(getCatalogUrl());
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  const json = (await response.json()) as CatalogResponse;
  const links = json.links ?? {};
  const actionLinks: CatalogActionLink[] = [];
  const steamWishlist = getLinkByKey(links, "steamWishlist");

  if (steamWishlist) {
    actionLinks.push({
      href: steamWishlist,
      label: getDefaultPlatformLabel("steamWishlist"),
      platform: "steamWishlist",
    });
  }

  for (const [key, href] of Object.entries(links)) {
    const platform = resolveSocialPlatform(key);
    if (!platform) continue;

    actionLinks.push({
      href,
      label: getSocialActionLabel(key, platform),
      platform,
    });
  }

  return actionLinks;
};
