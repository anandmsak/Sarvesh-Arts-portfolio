import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Artist — Sri Sarvesan Arts" },
      { name: "description", content: "The story, philosophy and lineage behind Sri Sarvesan Arts." },
    ],
  }),
  component: About,
});

interface AboutContent {
  artist_image_url: string;
  about_heading: string;
  about_p1: string;
  about_p2: string;
  about_quote: string;
  about_p3: string;
  about_mission: string;
  about_vision: string;
}

function About() {
  const [content, setContent] = useState<AboutContent>({
    artist_image_url: "",
    about_heading: "Preserving the Sacred Artistic Heritage of the ŚRĪVAIṢṆAVA SAMPRADĀYA",
    about_p1: "Sri Sarvesan Arts is a traditional art studio dedicated to preserving and promoting the sacred artistic heritage of the Śrīvaiṣṇava Sampradāya through authentic, scripture-inspired artworks. Every artwork is created with careful study of Śilpa Śāstra, traditional iconography, and temple art traditions.",
    about_p2: "The studio specializes in traditional drawings, acrylic paintings, temple commissions, and custom devotional artworks for temples, mutts, and devotees. Each commission is approached with reverence, attention to detail, and a commitment to preserving the spiritual and artistic legacy of our tradition.",
    about_quote: "Every artwork begins with devotion and study. By drawing inspiration from Śilpa Śāstra and traditional iconographic principles, each creation strives to honor the spiritual significance of the subject while maintaining artistic excellence and respect for the living traditions of the Śrīvaiṣṇava sampradāya.",
    about_p3: "The definitive aim is to produce paintings that are not only visually appealing but also strictly faithful to the iconographic principles followed in the Śrīvaiṣṇava tradition. As the collection continues to grow, Sri Sarvesan Arts seeks to contribute to the preservation of traditional Indian sacred art and inspire greater appreciation for authentic iconography.",
    about_mission: "To preserve and promote the sacred artistic heritage of the Śrīvaiṣṇava tradition by creating authentic, Śilpa Śāstra-inspired artworks for temples, devotees, and future generations.",
    about_vision: "To establish Sri Sarvesan Arts as a trusted name in traditional Śrīvaiṣṇava art, known for scriptural authenticity, artistic excellence, and meaningful contributions to the preservation of India's sacred artistic heritage."
  });

  useEffect(() => {
    const loadDynamicBioContent = async () => {
      try {
        const { data } = await supabase
          .from('studio_settings')
          .select('artist_image_url, about_heading, about_p1, about_p2, about_quote, about_p3, about_mission, about_vision')
          .eq('id', 1)
          .single();
          
        if (data) {
          setContent({
            artist_image_url: data.artist_image_url,
            about_heading: data.about_heading,
            about_p1: data.about_p1,
            about_p2: data.about_p2,
            about_quote: data.about_quote,
            about_p3: data.about_p3,
            about_mission: data.about_mission,
            about_vision: data.about_vision
          });
        }
      } catch (err) {
        console.error("Error loading artist narrative components from Supabase:", err);
      }
    };
    loadDynamicBioContent();
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="The Artist"
        subtitle="A journey of faith, learning and disciplined practice — devoted to preserving the sacred visual language of South India."
      />

      {/* Main Structural Bio Layout Block */}
      <section className="py-20 bg-[#FCFBF7]">
        <div className="mx-auto max-w-6xl px-6 grid gap-16 md:grid-cols-[1fr_1.4fr] items-start">
          
          {/* Column 1: Dynamic Portrait Area */}
          <div className="animate-scale-in sticky top-28">
            <div className="ornate-border aspect-[3/4] w-full overflow-hidden rounded-md bg-[color-mix(in_oklab,var(--gold)_20%,var(--ivory))] shadow-xl border border-gold/40">
              {content.artist_image_url ? (
                <img 
                  src={content.artist_image_url} 
                  alt="Sri Sarvesan Profile" 
                  /* ANTI-DOWNLOAD PORTRAIT PROTECTION INJECTED */
                  className="object-cover w-full h-full animate-fade-in filter sepia-[15%] contrast-[102%] select-none pointer-events-none" 
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-white py-20">
                  <span className="font-display text-7xl text-gold/80">॥ ॐ ॥</span>
                  <span className="font-serif text-xs uppercase tracking-[0.4em] text-primary/70">
                    Portrait Placeholder
                  </span>
                </div>
              )}
            </div>
            <p className="mt-4 text-center font-serif text-xs tracking-widest uppercase text-gold">
              Sri Sarvesan M G
            </p>
          </div>

          {/* Column 2: Scripture-Inspired Studio Content */}
          <div className="space-y-8 font-serif leading-relaxed text-foreground/80 text-lg animate-fade-in">
            <h3 className="font-display text-2xl text-primary tracking-wide leading-tight">
              {content.about_heading}
            </h3>
            
            <p className="whitespace-pre-wrap">{content.about_p1}</p>
            
            <p className="whitespace-pre-wrap">{content.about_p2}</p>

            <blockquote className="border-l-2 border-gold pl-6 italic text-[#800020] bg-gold/5 py-4 pr-4 my-6 rounded-r whitespace-pre-wrap">
              "{content.about_quote}"
            </blockquote>

            <p className="whitespace-pre-wrap">{content.about_p3}</p>

            {/* Core Mission & Vision Sub-Grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gold/20">
              <div className="space-y-2">
                <h4 className="font-display text-sm uppercase tracking-wider text-gold">Our Mission</h4>
                <p className="text-base text-foreground/70 whitespace-pre-wrap">{content.about_mission}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-sm uppercase tracking-wider text-gold">Our Vision</h4>
                <p className="text-base text-foreground/70 whitespace-pre-wrap">{content.about_vision}</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </SiteLayout>
  );
}