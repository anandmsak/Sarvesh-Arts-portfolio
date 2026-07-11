import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import Preloader from "@/components/Preloader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sri Sarvesan Arts — Traditional South Indian Devotional Paintings" },
      {
        name: "description",
        content:
          "Sri Sarvesan Arts creates traditional South Indian temple paintings, pen and pencil drawings, and devotional artwork on commission.",
      },
      { property: "og:title", content: "Sri Sarvesan Arts" },
      {
        property: "og:description",
        content: "Traditional South Indian devotional paintings & temple commissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showDesktopAlert, setShowDesktopAlert] = useState<boolean>(false);
  const [isPreloaderFinished, setIsPreloaderFinished] = useState<boolean>(false);

  useEffect(() => {
    if (isPreloaderFinished) {
      // Check for touch interface signatures or smaller screen configurations
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 1024;
      
      // Prevent showing multiple times if already dismissed in the active tab session
      const hasDismissedSuggestion = sessionStorage.getItem("desktop_view_suggestion_dismissed");
      
      if (isMobileDevice && !hasDismissedSuggestion) {
        setShowDesktopAlert(true);
      }
    }
  }, [isPreloaderFinished]);

  const closeAlertHandler = () => {
    setShowDesktopAlert(false);
    sessionStorage.setItem("desktop_view_suggestion_dismissed", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Listens to execution completion from the preloader hooks */}
      <Preloader onComplete={() => setIsPreloaderFinished(true)}>
        <Outlet />
      </Preloader>

      {/* Aesthetic Mobile Device Recommendation Modal Dialog Layer */}
      {showDesktopAlert && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-serif">
          <div className="w-full max-w-sm bg-[#FCFBF7] border-2 border-[#D4AF37]/50 p-6 rounded-lg text-center shadow-2xl relative animate-scale-in">
            <span className="font-display text-3xl text-[#D4AF37] block mb-2">॥ ॐ ॥</span>
            
            <h3 className="text-xl text-[#800020] font-bold tracking-wide">
              Desktop View Recommended
            </h3>
            
            <p className="mt-3 text-xs text-[#3D2B1F]/80 leading-relaxed italic">
              To fully appreciate the rich, intricate gold leaf textures, fine traditional strokes, and grand scale details of our sacred art pieces, viewing this gallery space on a desktop monitor is highly recommended.
            </p>
            
            <button
              onClick={closeAlertHandler}
              className="mt-6 w-full bg-[#800020] hover:bg-[#600018] text-white py-2.5 rounded text-xs uppercase tracking-widest font-medium shadow transition-colors duration-200"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}