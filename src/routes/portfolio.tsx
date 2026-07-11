import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Sri Sarvesan Arts" },
      {
        name: "description",
        content:
          "A gallery of temple paintings, pen and pencil drawings, and devotional works.",
      },
    ],
  }),
  component: Portfolio,
});

type Category =
  | "Temple Paintings"
  | "Pen/Pencil Drawings"
  | "Acrylic Paintings"
  | "Work in Progress";

type Status = "Available" | "Commissioned" | "Sold";

type Artwork = {
  id: string;
  title: string;
  category: Category;
  medium: string;
  dimensions: string;
  year: number;
  description: string;
  traditional_significance: string;
  status: Status;
  imageUrl?: string;
};

const defaultArtworks: Artwork[] = [
  {
    id: "1",
    title: "Sri Nataraja",
    category: "Temple Paintings",
    medium: "Natural Pigments & Gold Leaf on Canvas",
    dimensions: "24 x 36 inches",
    year: 2024,
    description: "The cosmic dance of Lord Shiva rendered in traditional Tanjore idiom with layered gold leaf detailing.",
    traditional_significance: "Nataraja symbolises the eternal rhythm of creation, preservation and dissolution — the dance that upholds the universe.",
    status: "Available",
  },
  {
    id: "2",
    title: "Meenakshi Amman",
    category: "Acrylic Paintings",
    medium: "Acrylic on Canvas",
    dimensions: "18 x 24 inches",
    year: 2024,
    description: "A luminous portrait of the fish-eyed goddess of Madurai, adorned in temple regalia and traditional jewellery.",
    traditional_significance: "Meenakshi is worshipped as an embodiment of divine feminine sovereignty and compassion.",
    status: "Commissioned",
  },
  {
    id: "3",
    title: "Lord Venkateswara",
    category: "Pen/Pencil Drawings",
    medium: "Ink on Handmade Paper",
    dimensions: "12 x 18 inches",
    year: 2023,
    description: "Fine linework depicting the Lord of Seven Hills with intricate ornamentation and namam detail.",
    traditional_significance: "Venkateswara is revered as the compassionate deity of the Kali Yuga, bestower of grace upon devotees.",
    status: "Sold",
  },
  {
    id: "4",
    title: "Krishna Leela",
    category: "Temple Paintings",
    medium: "Gold Leaf & Natural Pigments",
    dimensions: "20 x 30 inches",
    year: 2024,
    description: "A serene depiction of Krishna with the divine flute, surrounded by peacocks and lotus motifs.",
    traditional_significance: "Krishna's flute symbolises the calling of the soul — the eternal song that draws devotees toward the divine.",
    status: "Available",
  },
  {
    id: "5",
    title: "Devi Saraswati",
    category: "Pen/Pencil Drawings",
    medium: "Graphite on Paper",
    dimensions: "11 x 14 inches",
    year: 2023,
    description: "The goddess of learning rendered in delicate graphite, seated upon her lotus with veena in hand.",
    traditional_significance: "Saraswati embodies wisdom, music and the pure flow of knowledge across all traditions.",
    status: "Available",
  },
  {
    id: "6",
    title: "Ananta Padmanabha",
    category: "Temple Paintings",
    medium: "Mural on Wood Panel",
    dimensions: "36 x 48 inches",
    year: 2024,
    description: "Vishnu reclining upon Ananta Sesha in the cosmic ocean, painted in classical Kerala mural tradition.",
    traditional_significance: "This form represents the sustaining consciousness of the universe in restful, eternal contemplation.",
    status: "Commissioned",
  },
  {
    id: "7",
    title: "Ganesha (In Progress)",
    category: "Work in Progress",
    medium: "Acrylic on Canvas",
    dimensions: "16 x 20 inches",
    year: 2025,
    description: "An ongoing work capturing the remover of obstacles with early gold detailing under way.",
    traditional_significance: "Ganesha is invoked at the start of every sacred endeavour as the bestower of auspiciousness.",
    status: "Available",
  },
  {
    id: "8",
    title: "Lakshmi Devi",
    category: "Acrylic Paintings",
    medium: "Acrylic & Gold on Canvas",
    dimensions: "18 x 24 inches",
    year: 2024,
    description: "The goddess of prosperity seated upon a blooming lotus, flanked by sacred elephants.",
    traditional_significance: "Lakshmi represents abundance in all forms — spiritual, material and inner richness.",
    status: "Available",
  },
  {
    id: "9",
    title: "Murugan (Study)",
    category: "Work in Progress",
    medium: "Pencil on Paper",
    dimensions: "9 x 12 inches",
    year: 2025,
    description: "Preparatory study of Lord Murugan with vel in hand, exploring pose and proportion.",
    traditional_significance: "Murugan, the warrior son of Shiva, embodies youth, courage and spiritual valour.",
    status: "Available",
  },
];

const filters = [
  "All",
  "Temple Paintings",
  "Pen/Pencil Drawings",
  "Acrylic Paintings",
  "Work in Progress",
] as const;
type Filter = (typeof filters)[number];

function Portfolio() {
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [galleryItems, setGalleryItems] = useState<Artwork[]>([]);

  useEffect(() => {
    const fetchLiveGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedArts = data.map((art: any) => ({
            id: art.id,
            title: art.title,
            category: art.category,
            medium: art.medium,
            dimensions: art.dimensions,
            year: art.year,
            description: art.description || '',
            traditional_significance: art.traditional_significance || '',
            status: art.status,
            imageUrl: art.image_url
          }));
          setGalleryItems(formattedArts);
        } else {
          setGalleryItems([]);
        }
      } catch (err) {
        console.error("Error connecting dynamic portfolio elements:", err);
        setGalleryItems([]);
      }
    };
    fetchLiveGallery();
  }, []);

  const visible = useMemo(() => {
    if (filter === "All") return galleryItems;
    
    return galleryItems.filter((artwork) => {
      if (!artwork.category) return false;
      
      const cleanArtworkCategory = artwork.category.trim().toLowerCase();
      const cleanFilterTarget = filter.trim().toLowerCase();
      
      return cleanArtworkCategory === cleanFilterTarget || 
             cleanArtworkCategory.startsWith(cleanFilterTarget) || 
             cleanFilterTarget.startsWith(cleanArtworkCategory);
    });
  }, [filter, galleryItems]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Gallery"
        title="Portfolio"
        subtitle="A living archive of devotional works — temple paintings, ink drawings, acrylic canvases and pieces still taking form in the studio."
      />

      {/* Filter bar */}
      <div className="sticky top-[73px] z-20 border-b border-gold/30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "whitespace-nowrap rounded-sm border px-5 py-2 font-serif text-xs uppercase tracking-[0.25em] transition " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gold/50 text-foreground/70 hover:border-gold hover:text-primary")
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {visible.length === 0 ? (
            <p className="py-24 text-center font-serif italic text-muted-foreground">
              No artworks in this category yet.
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 w-full">
              {visible.map((art, i) => (
                <button
                  key={art.id}
                  onClick={() => setSelected(art)}
                  className="group animate-fade-in overflow-hidden rounded-md border border-gold/40 bg-card text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-sm"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ArtworkImage title={art.title} status={art.status} imageUrl={art.imageUrl} />
                  <div className="border-t border-gold/30 p-5">
                    <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-gold">
                      {art.category}
                    </p>
                    <h3 className="mt-2 font-display text-lg text-primary">
                      {art.title}
                    </h3>
                    <p className="mt-1 font-serif text-sm italic text-muted-foreground">
                      {art.medium}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl overflow-hidden border-gold/50 bg-background p-0">
          {selected && (
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <div className="relative bg-[color-mix(in_oklab,var(--gold)_15%,var(--ivory))]">
                <ArtworkImage title={selected.title} status={selected.status} imageUrl={selected.imageUrl} large />
              </div>
              <div className="max-h-[85vh] overflow-y-auto p-8">
                <p className="font-serif text-[10px] uppercase tracking-[0.4em] text-gold">
                  {selected.category}
                </p>
                <DialogTitle asChild>
                  <h2 className="mt-2 font-display text-3xl text-primary">
                    {selected.title}
                  </h2>
                </DialogTitle>
                <div className="gold-divider mt-4 max-w-[8rem]" aria-hidden>✦</div>

                <dl className="mt-6 space-y-4 font-serif text-sm">
                  <MetaRow label="Medium" value={selected.medium} />
                  <MetaRow label="Dimensions" value={selected.dimensions} />
                  <MetaRow label="Year" value={String(selected.year)} />
                  <MetaRow
                    label="Status"
                    value={
                      <span
                        className={
                          "rounded-sm px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] " +
                          (selected.status === "Available"
                            ? "bg-primary text-primary-foreground"
                            : selected.status === "Commissioned"
                              ? "bg-gold/25 text-primary"
                              : "bg-muted text-muted-foreground")
                        }
                      >
                        {selected.status}
                      </span>
                    }
                  />
                </dl>

                <div className="mt-8">
                  <h3 className="font-serif text-[11px] uppercase tracking-[0.3em] text-gold">
                    Description
                  </h3>
                  <p className="mt-2 font-serif italic leading-relaxed text-foreground/80">
                    {selected.description}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="font-serif text-[11px] uppercase tracking-[0.3em] text-gold">
                    Traditional Significance
                  </h3>
                  <p className="mt-2 font-serif italic leading-relaxed text-foreground/80">
                    {selected.traditional_significance}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function ArtworkImage({
  title,
  status,
  imageUrl,
  large = false,
}: {
  title: string;
  status: Status;
  imageUrl?: string;
  large?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden bg-[color-mix(in_oklab,var(--gold)_15%,var(--ivory))] " +
        (large ? "h-full min-h-[420px]" : "aspect-[4/5]")
      }
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title} 
          /* ANTI-DOWNLOAD IMPLEMENTED: Disables native drag blocks, drop menus, and hover highlights */
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-6xl text-gold/70">॥ ॐ ॥</span>
            <span className="font-serif text-[10px] uppercase tracking-[0.35em] text-primary/60">
              {title}
            </span>
          </div>
        </div>
      )}

      {!large && (
        <span className="absolute right-3 top-3 rounded-sm bg-primary/90 px-2.5 py-1 font-serif text-[9px] uppercase tracking-[0.25em] text-primary-foreground">
          {status}
        </span>
      )}

      {/* Faint logo watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-gold/40 bg-background/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.3em] text-primary/50 backdrop-blur-sm"
      >
        <span className="font-display text-sm leading-none text-gold/70">॥</span>
        <span className="font-serif">Sri Sarvesan</span>
      </div>
    </div>
  );
}