import { useEffect, useMemo, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaSteamSymbol,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import {
  fetchActionLinks,
  resolveCdnAssetUrl,
  resolveBackgroundImageUrl,
  type ActionPlatform,
  type CatalogActionLink,
} from "./lib/catalog";

const actionPlatformMeta: Record<
  ActionPlatform,
  { icon: typeof FaSteamSymbol }
> = {
  steamWishlist: { icon: FaSteamSymbol },
  facebook: { icon: FaFacebookF },
  instagram: { icon: FaInstagram },
  pinterest: { icon: FaPinterestP },
  tiktok: { icon: FaTiktok },
  youtube: { icon: FaYoutube },
};

const pickBackgroundTier = () => {
  const maxViewport = Math.max(window.innerWidth, window.innerHeight);
  const scaledViewport = maxViewport * window.devicePixelRatio;

  if (scaledViewport <= 1200) return "low";
  if (scaledViewport <= 2200) return "mid";
  return "high";
};

function App() {
  const [backgroundTier, setBackgroundTier] = useState<"low" | "mid" | "high">(
    pickBackgroundTier,
  );
  const [actionLinks, setActionLinks] = useState<CatalogActionLink[]>([]);

  useEffect(() => {
    const onResize = () => setBackgroundTier(pickBackgroundTier());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isActive = true;

    void fetchActionLinks()
      .then((links) => {
        if (isActive) {
          setActionLinks(links);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load action links from catalog", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const backgroundImage = useMemo(
    () => `url("${resolveBackgroundImageUrl(backgroundTier)}")`,
    [backgroundTier],
  );
  const steamActionLink = useMemo(
    () => actionLinks.find(({ platform }) => platform === "steamWishlist"),
    [actionLinks],
  );
  const facebookActionLink = useMemo(
    () => actionLinks.find(({ platform }) => platform === "facebook"),
    [actionLinks],
  );
  const logoImage = useMemo(
    () => resolveCdnAssetUrl("/shared/logos/pokoje_logo_alt.png"),
    [],
  );

  return (
    <main className="landing" style={{ backgroundImage }}>
      {facebookActionLink ? (
        <a
          href={facebookActionLink.href}
          className="mobile-steam-action steam-wishlist-button"
          aria-label={`Visit ${facebookActionLink.label}`}
        >
          <span className="steam-wishlist-button__icon" aria-hidden="true">
            <FaFacebookF />
          </span>
        </a>
      ) : null}
      <section className="content">
        <img
          className="game-title"
          src={logoImage}
          alt="Pokoje"
          draggable={false}
        />
        <div className="cta-panel">
          <p className="cta-copy">
            <strong>Pokoje</strong> is a relaxing design game where creativity
            takes center stage. Transform fully furnished blank rooms into warm,
            inviting spaces using a rich collection of fabrics, textures,
            patterns, and paints.
          </p>
          <div className="store-buttons">
            <a
              href="https://play.pokorama.com/"
              className="store-link slots-counter-button"
              aria-label="Play Demo"
            >
              <span className="slots-counter-button__icon" aria-hidden="true">
                <img
                  className="store-icon"
                  src="https://cdn.pokorama.com/demo/shared/icons/normal/sparkle.png"
                  alt=""
                />
              </span>
              <span className="slots-counter-button__text">Play Demo</span>
            </a>
            {steamActionLink ? (
              <a
                href={steamActionLink.href}
                className="store-link slots-counter-button cta-button--white"
                aria-label={`Visit ${steamActionLink.label}`}
              >
                <span className="slots-counter-button__icon" aria-hidden="true">
                  <FaSteamSymbol />
                </span>
                <span className="slots-counter-button__text">Visit Steam</span>
              </a>
            ) : null}
          </div>
        </div>
      </section>
      <div className="bottom-actions">
        {actionLinks
          .filter(({ platform }) => platform !== "steamWishlist")
          .map(({ href, label, platform }) => {
            const { icon: Icon } = actionPlatformMeta[platform];

            return (
              <a
                key={`${platform}-${href}`}
                href={href}
                className="steam-wishlist-button steam-wishlist-button--big"
                aria-label={`Visit ${label}`}
              >
                <span
                  className="steam-wishlist-button__icon"
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <span className="steam-wishlist-button__text">{label}</span>
              </a>
            );
          })}
      </div>
    </main>
  );
}

export default App;
