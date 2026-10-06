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

// Same four-point star as the one cut into the logo's first "o".
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0c0 7 5 12 12 12-7 0-12 5-12 12 0-7-5-12-12-12 7 0 12-5 12-12Z" />
  </svg>
);

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

  // Two layers of the same image; the wide layout positions them separately.
  const backgroundImage = useMemo(() => {
    const image = `url("${resolveBackgroundImageUrl(backgroundTier)}")`;
    return `${image}, ${image}`;
  }, [backgroundTier]);
  const steamActionLink = useMemo(
    () => actionLinks.find(({ platform }) => platform === "steamWishlist"),
    [actionLinks],
  );
  const socialLinks = useMemo(
    () => actionLinks.filter(({ platform }) => platform !== "steamWishlist"),
    [actionLinks],
  );
  const logoImage = useMemo(
    () => resolveCdnAssetUrl("/shared/logos/pokoje_logo_alt.png"),
    [],
  );

  return (
    <main className="landing" style={{ backgroundImage }}>
      <div className="column">
        <h1 className="logo">
          <img src={logoImage} alt="pokoje" draggable={false} />
        </h1>
        <div className="sheet">
          <div className="pitch">
            <p className="pitch__lead">
              pokoje is a relaxing design game where creativity takes center
              stage.
            </p>
            <p className="pitch__more">
              Transform fully furnished blank rooms into warm, inviting spaces
              using a rich collection of fabrics, textures, patterns, and
              paints.
            </p>
          </div>
          <div className="actions">
            <a
              href="https://play.pokorama.com/"
              className="button button--primary"
            >
              <span className="button__icon">
                <SparkleIcon />
              </span>
              Play demo
            </a>
            {steamActionLink ? (
              <a href={steamActionLink.href} className="button button--glass">
                <span className="button__icon" aria-hidden="true">
                  <FaSteamSymbol />
                </span>
                Wishlist on Steam
              </a>
            ) : null}
          </div>
          <ul className="socials">
            {socialLinks.map(({ href, label, platform }) => {
              const { icon: Icon } = actionPlatformMeta[platform];

              return (
                <li key={`${platform}-${href}`}>
                  <a
                    href={href}
                    className="social"
                    aria-label={`pokoje on ${label}`}
                    title={label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default App;
