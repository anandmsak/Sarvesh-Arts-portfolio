import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, Pencil, Palette, Sparkles } from "lucide-react";
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute("/")({
  component: Home,
});

type Artwork = {
  id: string;
  title: string;
  category: string;
  medium: string;
  status: "Available" | "Commissioned" | "Sold";
  imageUrl?: string;
};

type TempleProject = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
};

type Review = {
  id: string;
  client_name: string;
  review_type: "Text" | "Screenshot";
  review_text?: string;
  image_url?: string;
};

type ProcessStep = {
  iconType: "pencil" | "palette" | "sparkles";
  step: string;
  title: string;
  body: string;
  imageUrl?: string;
};

const defaultFeaturedArtworks: Artwork[] = [
  { id: "1", title: "Sri Nataraja", category: "Temple Painting", medium: "Natural Pigments on Canvas", status: "Available" },
  { id: "2", title: "Meenakshi Amman", category: "Acrylic Painting", medium: "Acrylic on Canvas", status: "Commissioned" },
  { id: "3", title: "Lord Venkateswara", category: "Pen & Ink", medium: "Ink on Handmade Paper", status: "Sold" },
  { id: "4", title: "Krishna Leela", category: "Temple Painting", medium: "Gold Leaf & Pigments", status: "Available" },
  { id: "5", title: "Devi Saraswati", category: "Pencil Drawing", medium: "Graphite on Paper", status: "Available" },
  { id: "6", title: "Ananta Padmanabha", category: "Temple Painting", medium: "Mural on Wood", status: "Commissioned" },
];

const defaultProcessSteps: ProcessStep[] = [
  {
    iconType: "pencil",
    step: "01",
    title: "Sketch",
    body: "The composition begins with reverent reference — proportion, mudra and iconographic detail drawn faithfully by hand.",
  },
  {
    iconType: "palette",
    step: "02",
    title: "Work in Progress",
    body: "Layer upon layer of traditional pigment, ink or acrylic is applied with patient discipline over many weeks.",
  },
  {
    iconType: "sparkles",
    step: "03",
    title: "Final",
    body: "Gold accents, fine outlining and a devotional finishing ritual complete the artwork before it reaches your shrine.",
  },
];

const iconMap = {
  pencil: Pencil,
  palette: Palette,
  sparkles: Sparkles,
};

function Home() {
  const location = useLocation(); // Hook to listen to path and hash changes dynamically
  const [studioLogo, setStudioLogo] = useState<string>("");
  const [artworks, setArtworks] = useState<Artwork[]>(defaultFeaturedArtworks);
  const [templeProjects, setTempleProjects] = useState<TempleProject[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(defaultProcessSteps);
  const [heroImage, setHeroImage] = useState<string>("");
  
  const [heroTitle, setHeroTitle] = useState<string>("Devotion, rendered in ink & gold.");
  const [heroSub, setHeroSub] = useState<string>("A quiet studio devoted to traditional South Indian temple painting, intricate pen & pencil drawings, and sacred commissions crafted with heritage and prayer.");

  // 1. Initial Load: Fetch all stable data columns from Cloud Storage
  useEffect(() => {
    const fetchLiveDatabaseAssets = async () => {
      try {
        const { data: settings } = await supabase.from('studio_settings').select('*').eq('id', 1).single();
        if (settings) {
          if (settings.logo_url) setStudioLogo(settings.logo_url);
          if (settings.hero_slogan_title) setHeroTitle(settings.hero_slogan_title);
          if (settings.hero_slogan_sub) setHeroSub(settings.hero_slogan_sub);
          if (settings.hero_image_url) setHeroImage(settings.hero_image_url);
        }

        const { data: arts } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
        if (arts && arts.length > 0) {
          setArtworks(arts.map((art: any) => ({
            id: art.id,
            title: art.title,
            category: art.category,
            medium: art.medium,
            status: art.status,
            imageUrl: art.image_url
          })));
        }

        const { data: temples } = await supabase.from('temple_projects').select('*').order('created_at', { ascending: false });
        if (temples && temples.length > 0) {
          setTempleProjects(temples.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            imageUrl: t.image_url
          })));
        }

        const { data: revList } = await supabase.from('studio_reviews').select('*').order('created_at', { ascending: false });
        if (revList) {
          setReviews(revList);
        }
      } catch (err) {
        console.error("Data connection pipelines execution issue:", err);
      }
    };

    fetchLiveDatabaseAssets();
  }, []);

  // 2. Active Anchor Monitor: Fires instantly whenever the routing location hash parameter updates
  useEffect(() => {
    if (location.hash === "reviews") {
      // Small timeout lets React complete rendering before triggering the view position change
      setTimeout(() => {
        const element = document.getElementById("reviews");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    }
  }, [location.hash, reviews]); // Triggers immediately when clicking navigation items

  // Shared protection hook handler to block layout download events cleanly
  const preventDownloadAction = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <SiteLayout>
      {/* 1 · Hero Section */}
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-[#FCFBF7]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--gold)_12%,var(--ivory))_0%,var(--ivory)_80%)]"
        />

        {heroImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-5 transition-transform duration-1000 transform scale-105 pointer-events-none select-none"
            style={{ backgroundImage: `url(${heroImage})` }}
            onContextMenu={preventDownloadAction}
          />
        )}

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="animate-fade-in">
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
              ॥ Sri Sarvesan Arts ॥
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-primary md:text-7xl whitespace-pre-line">
              {heroTitle}
            </h1>
            <div className="gold-divider mt-8 max-w-xs" aria-hidden>✦</div>
            <p className="mt-6 max-w-xl font-serif text-lg italic text-foreground/75">
              {heroSub}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/portfolio"
                className="rounded-sm bg-primary px-8 py-3.5 font-serif text-sm uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-maroon-deep"
              >
                View Portfolio
              </Link>
              <Link
                to="/commissions"
                className="story-link rounded-sm border border-gold px-8 py-3.5 font-serif text-sm uppercase tracking-[0.25em] text-primary transition hover:bg-gold/10"
              >
                Commission a Piece
              </Link>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-md bg-[conic-gradient(from_45deg,transparent,color-mix(in_oklab,var(--gold)_40%,transparent),transparent_60%)] blur-2xl"
            />
            <div className="ornate-border relative aspect-[4/5] w-full overflow-hidden rounded-md bg-[color-mix(in_oklab,var(--gold)_20%,var(--ivory))] border border-gold/40 shadow-xl">
              {heroImage ? (
                <img 
                  src={heroImage} 
                  alt="Masterpiece Hero Asset" 
                  className="object-cover w-full h-full animate-fade-in select-none pointer-events-none" 
                  onContextMenu={preventDownloadAction}
                  onDragStart={preventDownloadAction}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-white py-20">
                  <span className="font-display text-7xl text-gold/80">॥ ॐ ॥</span>
                  <span className="font-serif text-xs uppercase tracking-[0.4em] text-primary/70">
                    Masterpiece · Placeholder
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2 · About snippet */}
      <section className="border-y border-gold/30 bg-[color-mix(in_oklab,var(--ivory)_94%,var(--gold))] py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="ornate-border mx-auto aspect-square w-56 rounded-full bg-card md:w-64 overflow-hidden flex items-center justify-center bg-white border border-gold/40">
            {studioLogo ? (
              <img 
                src={studioLogo} 
                className="w-full h-full object-cover rounded-full animate-fade-in select-none pointer-events-none" 
                alt="Artist Profile Logo" 
                onContextMenu={preventDownloadAction}
                onDragStart={preventDownloadAction}
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl text-gold">
                ॥
              </div>
            )}
          </div>
          <div>
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
              The Artist
            </p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              A lifetime of quiet, sacred practice.
            </h2>
            <div className="gold-divider mt-5 max-w-[10rem] md:mx-0" aria-hidden>✦</div>
            <p className="mt-6 font-serif text-lg italic leading-relaxed text-foreground/75">
              Trained in the classical traditions of South Indian temple art,
              the artist behind Sri Sarvesan Arts blends heritage iconography
              with the patience of a devotee — each stroke a small offering.
            </p>
            <Link
              to="/about"
              className="story-link mt-6 inline-flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-primary"
            >
              Read the story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 · Featured Artworks Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
              From the Studio
            </p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Featured Artworks
            </h2>
            <div className="gold-divider mx-auto mt-5 max-w-xs" aria-hidden>✦</div>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-8 w-full">
            {artworks.slice(0, 6).map((art, i) => (
              <article
                key={art.id}
                className="group animate-fade-in overflow-hidden rounded-md border border-gold/40 bg-card shadow-[0_1px_0_0_var(--gold)] transition duration-300 hover:-translate-y-1 hover:shadow-lg w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[color-mix(in_oklab,var(--gold)_15%,var(--ivory))]">
                  {art.imageUrl ? (
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" 
                      onContextMenu={preventDownloadAction}
                      onDragStart={preventDownloadAction}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-5xl text-gold/70 transition-transform duration-500 group-hover:scale-105">
                      ॥ ॐ ॥
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-sm bg-primary/90 px-3 py-1 font-serif text-[10px] uppercase tracking-[0.25em] text-primary-foreground">
                    {art.status}
                  </span>
                </div>
                <div className="border-t border-gold/30 p-6 text-center">
                  <p className="font-serif text-[11px] uppercase tracking-[0.35em] text-gold">
                    {art.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl text-primary">
                    {art.title}
                  </h3>
                  <p className="mt-2 font-serif text-sm italic text-muted-foreground">
                    {art.medium}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/portfolio"
              className="story-link inline-flex items-center gap-2 font-serif text-sm uppercase tracking-[0.3em] text-primary"
            >
              Explore the full portfolio <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 · Temple Commissions Section */}
      <section className="relative overflow-hidden bg-[color-mix(in_oklab,var(--maroon)_96%,black)] py-24 text-ivory">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,var(--gold)_1px,transparent_0)] [background-size:32px_32px]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
              Sacred Requests
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Temple Commissions
            </h2>
            <div className="gold-divider mt-5 max-w-[10rem]" aria-hidden>✦</div>
            
            {templeProjects.length === 0 ? (
              <div>
                <p className="mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-ivory/80">
                  From intimate home altars to elaborate mandapam murals — every
                  commission is undertaken as a sacred offering, guided by
                  tradition and shaped to your intention.
                </p>
                <p className="mt-2 text-xs text-gold/60 italic font-serif">Sacred project installation archive coming soon.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {templeProjects.map((proj) => (
                  <div key={proj.id} className="border-b border-gold/20 pb-3">
                    <h4 className="font-serif text-base text-gold">{proj.title}</h4>
                    <p className="text-xs text-ivory/70 mt-1 font-serif">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/commissions"
              className="mt-8 inline-flex items-center gap-2 rounded-sm border border-gold px-7 py-3 font-serif text-sm uppercase tracking-[0.25em] text-gold transition hover:bg-gold hover:text-primary"
            >
              Learn about commissions <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ornate-border aspect-[5/4] w-full rounded-md bg-[color-mix(in_oklab,var(--maroon)_75%,var(--gold))] overflow-hidden border border-gold/40">
            {templeProjects.length > 0 && templeProjects[0].imageUrl ? (
              <img 
                src={templeProjects[0].imageUrl} 
                alt="Latest Temple Project" 
                className="object-cover w-full h-full select-none pointer-events-none" 
                onContextMenu={preventDownloadAction}
                onDragStart={preventDownloadAction}
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-6xl text-gold bg-[#2B000A]">
                ॥ श्री ॥
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5 · Work Process Timeline Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
              The Craft
            </p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Work Process
            </h2>
            <div className="gold-divider mx-auto mt-5 max-w-xs" aria-hidden>✦</div>
            <p className="mx-auto mt-6 max-w-xl font-serif italic text-foreground/70">
              Sketch ➔ Work in Progress ➔ Final
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-[linear-gradient(to_right,transparent,var(--gold),transparent)] md:block"
            />
            {processSteps.map(({ iconType, step, title, body, imageUrl }) => {
              const Icon = iconMap[iconType] || Sparkles;
              return (
                <div
                  key={step}
                  className="relative rounded-md border border-gold/40 bg-card p-8 text-center transition hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                >
                  {imageUrl ? (
                    <div className="mb-4 aspect-[4/3] rounded overflow-hidden bg-zinc-100">
                      <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        onContextMenu={preventDownloadAction}
                        onDragStart={preventDownloadAction}
                      />
                    </div>
                  ) : (
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold bg-background text-gold">
                      <Icon size={26} />
                    </div>
                  )}
                  <p className="mt-5 font-serif text-[11px] uppercase tracking-[0.4em] text-gold">
                    Step {step}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-primary">
                    {title}
                  </h3>
                  <p className="mt-3 font-serif italic leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.5 · Devotional Reviews & Testimonials Section */}
      <section id="reviews" className="py-34 bg-[color-mix(in_oklab,var(--ivory)_95%,var(--gold))] border-t border-gold/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">Blessings & Gratitude</p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">Devotee Experiences</h2>
            <div className="gold-divider mx-auto mt-5 max-w-xs" aria-hidden>✦</div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-center font-serif text-sm italic text-muted-foreground">Words of appreciation from home shrines and altars across the world coming soon.</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="break-inside-avoid rounded-md border border-gold/30 bg-white p-6 shadow-md transition duration-300 hover:shadow-lg flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center border-b border-gold/10 pb-2">
                    <h4 className="font-serif font-bold text-sm text-primary">{rev.client_name}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-gold border-gold/30 px-2 py-0">
                      {rev.review_type} Feedback
                    </Badge>
                  </div>

                  {rev.review_type === 'Text' ? (
                    <p className="font-serif text-base italic leading-relaxed text-foreground/80 before:content-['“'] after:content-['”']">
                      {rev.review_text}
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-sm border border-zinc-100 max-h-[450px] flex items-center justify-center bg-zinc-50 group cursor-zoom-in">
                      <img 
                        src={rev.image_url} 
                        alt={`Screenshot review from ${rev.client_name}`}
                        className="w-full h-auto object-contain transition duration-300 group-hover:scale-[1.02] select-none pointer-events-none"
                        onClick={() => window.open(rev.image_url, '_blank')}
                        onContextMenu={preventDownloadAction}
                        onDragStart={preventDownloadAction}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6 · CTA Section */}
      <section className="border-t border-gold/30 bg-[color-mix(in_oklab,var(--ivory)_92%,var(--gold))] py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
            Begin Your Offering
          </p>
          <h2 className="mt-4 font-display text-4xl text-primary md:text-5xl">
            Let a sacred piece find its place in your home.
          </h2>
          <div className="gold-divider mx-auto mt-6 max-w-xs" aria-hidden>✦</div>
          <Link
            to="/commissions"
            className="mt-10 inline-flex items-center gap-3 rounded-sm bg-primary px-10 py-4 font-serif text-sm uppercase tracking-[0.3em] text-primary-foreground shadow-md transition hover:bg-maroon-deep hover:shadow-lg"
          >
            Commission an Artwork <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}