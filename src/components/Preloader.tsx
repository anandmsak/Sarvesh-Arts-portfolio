import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Preloader — "The Sacred Mantra Spark"
 *
 * A full-screen intro layer that keeps the studio's landing page hidden
 * behind a quiet parchment canvas until the handful of images that matter
 * most on first paint (logo, hero/artist portrait, first row of the
 * gallery) have actually loaded. Everything else on the site loads lazily
 * as normal — this only ever waits on the small "critical" set, so a slow
 * connection is capped by `maxWaitTime` rather than left staring at ॥ ॐ ॥
 * indefinitely.
 *
 * The mark itself is drawn, not faded in: a small quill travels across
 * ॥ ॐ ॥, sketching a gold outline in a few uneven strokes, then a burgundy
 * ink fill soaks in behind it. Once the ink has dried (and the critical
 * images are ready), the mark draws inward to a small ember and then
 * bursts outward past its original size, dissolving into the page as it
 * grows — a single deliberate release rather than a repeating pulse.
 *
 * Usage:
 * <Preloader>
 * <App />
 * </Preloader>
 *
 * `children` mount immediately and render underneath the overlay — nothing
 * is delayed, only obscured — so there's no flash-of-unstyled-content once
 * the mark releases.
 */

type Phase = 'loading' | 'exiting' | 'done';

interface PreloaderProps {
  /** Optional explicit override. If omitted, the top critical images are pulled from Supabase. */
  imageUrls?: string[];
  /** How many gallery pieces (beyond logo + hero) count as "critical". */
  gallerySampleSize?: number;
  /** Floor so the full draw sequence (quill sketch → ink fill) always finishes, even on fast connections/caches. */
  minDisplayTime?: number;
  /** Ceiling so a slow connection never traps a visitor on the intro screen. */
  maxWaitTime?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

async function fetchCriticalImageUrls(gallerySampleSize: number): Promise<string[]> {
  try {
    const [{ data: settings }, { data: artworks }] = await Promise.all([
      supabase.from('studio_settings').select('logo_url, artist_image_url').eq('id', 1).single(),
      supabase
        .from('artworks')
        .select('image_url')
        .order('created_at', { ascending: false })
        .limit(gallerySampleSize),
    ]);

    const urls = [
      settings?.logo_url,
      settings?.artist_image_url,
      ...(artworks ?? []).map((a: { image_url: string }) => a.image_url),
    ].filter((url): url is string => Boolean(url));

    return urls.slice(0, 6);
  } catch {
    // Fail safe: if Supabase is unreachable, don't hold the site hostage —
    // just proceed with nothing to preload and let the loader resolve fast.
    return [];
  }
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // a broken asset shouldn't block the reveal
    img.src = url;
  });
}

export default function Preloader({
  imageUrls,
  gallerySampleSize = 4,
  minDisplayTime = 2500,
  maxWaitTime = 6000,
  onComplete,
  children,
}: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const startedAt = useRef<number>(Date.now());
  const settledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (settledRef.current || cancelled) return;
      settledRef.current = true;

      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      window.setTimeout(() => {
        if (cancelled) return;
        setPhase('exiting');
        // Matches the release animation (1.05s) plus the backdrop's 250ms delay, declared in the <style> block below.
        window.setTimeout(() => {
          if (!cancelled) {
            setPhase('done');
            onComplete?.();
          }
        }, 1300);
      }, remaining);
    };

    const hardTimeout = window.setTimeout(finish, maxWaitTime);

    (async () => {
      const urls = imageUrls?.length ? imageUrls : await fetchCriticalImageUrls(gallerySampleSize);
      if (cancelled) return;

      // Cache the local feather image asset automatically
      urls.push('/feather.png');

      if (urls.length === 0) {
        finish();
        return;
      }

      await Promise.all(urls.map(preloadImage));
      if (!cancelled) finish();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(hardTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'loading' || phase === 'exiting') {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [phase]);

  return (
    <>
      {phase !== 'done' && (
        <div
          className={`atelier-preloader${phase === 'exiting' ? ' atelier-preloader--exit' : ''}`}
          role="status"
          aria-live="polite"
          aria-label="Loading the studio"
        >
          <div className="atelier-preloader__glow" />
          <div className="atelier-preloader__mark-wrap">
            {/* Swapped inline SVG path out for the feather.png image wrapper asset flawlessly */}
            <span className="atelier-preloader__feather" aria-hidden="true">
              <img 
                src="/feather.png" 
                className="atelier-preloader__feather-img" 
                alt="" 
              />
            </span>
            <span className="atelier-preloader__mark atelier-preloader__mark--outline" aria-hidden="true">
              ॥ ॐ ॥
            </span>
            <span className="atelier-preloader__mark atelier-preloader__mark--ink" aria-hidden="true">
              ॥ ॐ ॥
            </span>
            <span className="atelier-preloader__sparkles" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </span>
          </div>
        </div>
      )}
      {children}

      <style>{`
        .atelier-preloader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FCFBF7;
        }

        .atelier-preloader__glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 60%);
          pointer-events: none;
        }

        .atelier-preloader__mark-wrap {
          position: relative;
          display: inline-block;
          transform-origin: 50% 50%;
        }

        .atelier-preloader__mark {
          position: relative;
          display: block;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          letter-spacing: 0.06em;
        }

        /* The quill: travels across the mark as it's drawn, dipping and
           lifting at the same points the sketch pauses between strokes. */
        .atelier-preloader__feather {
          position: absolute;
          width: clamp(25px, 4vw, 36px);
          height: clamp(25px, 4vw, 36px);
          left: -10%;
          top: 18%;
          opacity: 0;
          filter: drop-shadow(0 2px 4px rgba(61, 43, 31, 0.15));
          animation: atelier-feather-move 1.6s cubic-bezier(0.65, 0, 0.35, 1) 150ms forwards,
                     atelier-feather-fade 1.6s ease 150ms forwards;
          z-index: 5;
        }
        
        .atelier-preloader__feather-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        @keyframes atelier-feather-move {
          0%   { left: -10%; top: 20%; transform: rotate(-32deg); }
          28%  { left: 24%;  top: 4%;  transform: rotate(-14deg); }
          32%  { left: 24%;  top: 4%;  transform: rotate(-20deg); }
          58%  { left: 50%;  top: 24%; transform: rotate(-30deg); }
          62%  { left: 50%;  top: 24%; transform: rotate(-16deg); }
          100% { left: 95%;  top: 6%;  transform: rotate(-22deg); }
        }

        @keyframes atelier-feather-fade {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          82%  { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Layer 1 — the pencil sketch: a faint gold outline that traces the
           mark left to right in a few uneven strokes, following the quill. */
        .atelier-preloader__mark--outline {
          color: transparent;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1.5px rgba(212, 175, 55, 0.75);
          text-stroke: 1.5px rgba(212, 175, 55, 0.75);
          clip-path: inset(0 100% 0 0);
          animation: atelier-sketch 1.6s cubic-bezier(0.7, 0, 0.3, 1) 150ms forwards;
        }

        /* Layer 2 — the ink fill: solid burgundy that soaks in behind the
           sketch once the outline is mostly there, like ink filling a line drawing. */
        .atelier-preloader__mark--ink {
          position: absolute;
          inset: 0;
          color: #800020;
          clip-path: inset(0 100% 0 0);
          filter: blur(3px);
          opacity: 0;
          animation: atelier-ink-fill 1.1s cubic-bezier(0.45, 0, 0.2, 1) 1050ms forwards,
                     atelier-ink-focus 500ms ease-out 1050ms forwards;
        }

        @keyframes atelier-sketch {
          0%   { clip-path: inset(0 100% 0 0); }
          28%  { clip-path: inset(0 76% 0 0); }
          32%  { clip-path: inset(0 76% 0 0); }
          58%  { clip-path: inset(0 42% 0 0); }
          62%  { clip-path: inset(0 42% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
        }

        @keyframes atelier-ink-fill {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0.4; }
          100% { clip-path: inset(0 0% 0 0);   opacity: 1;   }
        }

        @keyframes atelier-ink-focus {
          0%   { filter: blur(3px); }
          100% { filter: blur(0); }
        }

        .atelier-preloader__sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* A few grains of gold dust that settle around the mark once the ink
           has dried, twinkling gently rather than sweeping across it. */
        .atelier-preloader__sparkles i {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #D4AF37;
          box-shadow: 0 0 6px 1px rgba(212, 175, 55, 0.8);
          opacity: 0;
          animation: atelier-twinkle 2.4s ease-in-out infinite;
        }
        .atelier-preloader__sparkles i:nth-child(1) { top: 8%;  left: 12%; animation-delay: 2.2s; }
        .atelier-preloader__sparkles i:nth-child(2) { top: 78%; left: 20%; animation-delay: 2.6s; }
        .atelier-preloader__sparkles i:nth-child(3) { top: 15%; left: 88%; animation-delay: 3.0s; }
        .atelier-preloader__sparkles i:nth-child(4) { top: 82%; left: 82%; animation-delay: 2.4s; }
        .atelier-preloader__sparkles i:nth-child(5) { top: 46%; left: 96%; animation-delay: 3.4s; }

        @keyframes atelier-twinkle {
          0%, 100% { opacity: 0;   transform: scale(0.4); }
          50%      { opacity: 1;   transform: scale(1);   }
        }

        .atelier-preloader--exit {
          opacity: 0;
          filter: blur(4px);
          transition: opacity 1000ms cubic-bezier(0.6, 0, 0.4, 1) 250ms,
                      filter 1000ms cubic-bezier(0.6, 0, 0.4, 1) 250ms;
        }

        /* Once fully drawn: a single, deliberate release — the mark draws
           inward to a small ember, then bursts out far past its original
           size and dissolves into the page as it grows, like ink blooming
           outward into light rather than simply fading in place. */
        .atelier-preloader--exit .atelier-preloader__mark-wrap {
          animation: atelier-release 1.05s cubic-bezier(0.6, 0, 0.35, 1) forwards;
        }

        @keyframes atelier-release {
          0%   { transform: scale(1);    opacity: 1; }
          38%  { transform: scale(0.2);  opacity: 1; }
          70%  { transform: scale(1.6);  opacity: 0.9; }
          100% { transform: scale(3);    opacity: 0;   }
        }

        @media (prefers-reduced-motion: reduce) {
          .atelier-preloader__feather {
            display: none;
          }
          .atelier-preloader__mark--outline {
            clip-path: none;
            animation: none;
            opacity: 0.85;
          }
          .atelier-preloader__mark--ink {
            clip-path: none;
            filter: none;
            opacity: 1;
            animation: none;
          }
          .atelier-preloader__sparkles {
            display: none;
          }
          .atelier-preloader--exit .atelier-preloader__mark-wrap {
            animation: none;
            opacity: 0;
          }
          .atelier-preloader {
            transition-duration: 300ms;
          }
        }
      `}</style>
    </>
  );
}