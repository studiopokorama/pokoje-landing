import { useEffect, useMemo, useState } from "react";
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaPinterestP,
  FaSteamSymbol,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import {
  fetchLandingLinks,
  resolveCdnAssetUrl,
  resolveBackgroundImageUrl,
  type ActionPlatform,
  type LandingLinks,
} from "./lib/catalog";

const actionPlatformMeta: Record<ActionPlatform, { icon: typeof FaFacebookF }> =
  {
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
  // null until the catalog answers; buttons hold their place without a target.
  const [links, setLinks] = useState<LandingLinks | null>(null);

  useEffect(() => {
    const onResize = () => setBackgroundTier(pickBackgroundTier());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isActive = true;

    void fetchLandingLinks()
      .then((landingLinks) => {
        if (isActive) {
          setLinks(landingLinks);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load links from catalog", error);
        if (isActive) {
          setLinks({ socials: [] });
        }
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
  const logoImage = useMemo(
    () => resolveCdnAssetUrl("/shared/logos/pokoje_logo_alt.png"),
    [],
  );

  const isPending = links === null;

  return (
    <main className="landing" style={{ backgroundImage }}>
      <div className="column">
        <h1 className="logo">
          <img src={logoImage} alt="Pokoje" draggable={false} />
        </h1>
        <div className="sheet">
          <div className="pitch">
            <p className="pitch__lead">
              Pokoje is a relaxing design game where creativity takes center
              stage.
            </p>
            <p className="pitch__more">
              Transform fully furnished blank rooms into warm, inviting spaces
              using a rich collection of fabrics, textures, patterns, and
              paints.
            </p>
          </div>
          {/* The demo and Steam build are for desktop; the tall layout offers the mobile apps. */}
          <div className="actions actions--desktop">
            {isPending || links.demo ? (
              <a href={links?.demo} className="button button--primary">
                <span className="button__icon">
                  <SparkleIcon />
                </span>
                Play demo
              </a>
            ) : null}
            {isPending || links.steam ? (
              <a href={links?.steam} className="button button--glass">
                <span className="button__icon" aria-hidden="true">
                  <FaSteamSymbol />
                </span>
                Wishlist on Steam
              </a>
            ) : null}
          </div>
          <div className="actions actions--mobile">
            {isPending || links.ios ? (
              <a
                href={links?.ios}
                className="button button--primary"
                aria-label="Download Pokoje on the App Store"
              >
                <span className="button__icon" aria-hidden="true">
                  <FaApple />
                </span>
                App Store
              </a>
            ) : null}
            {isPending || links.android ? (
              <a
                href={links?.android}
                className="button button--primary"
                aria-label="Get Pokoje on Google Play"
              >
                <span className="button__icon" aria-hidden="true">
                  <FaGooglePlay />
                </span>
                Google Play
              </a>
            ) : null}
          </div>
          <ul className="socials">
            {(links?.socials ?? []).map(({ href, label, platform }) => {
              const { icon: Icon } = actionPlatformMeta[platform];

              return (
                <li key={`${platform}-${href}`}>
                  <a
                    href={href}
                    className="social"
                    aria-label={`Pokoje on ${label}`}
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
