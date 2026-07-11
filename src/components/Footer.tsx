import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageSquare, Phone, Sparkles } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface StudioSettings {
  contact_email: string;
  instagram_username: string;
  instagram_url: string;
  whatsapp_number: string;
  logo_url: string;
}

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [settings, setSettings] = useState<StudioSettings>({
    contact_email: "srisarvesanarts@gmail.com",
    instagram_username: "@srisarvesanarts",
    instagram_url: "https://www.instagram.com/sri_sarvesan_arts?igsh=YWViY3p2cndvc3B0",
    whatsapp_number: "916374933410",
    logo_url: ""
  });

  useEffect(() => {
    const fetchBrandingAndLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('studio_settings')
          .select('contact_email, instagram_username, instagram_url, whatsapp_number, logo_url')
          .eq('id', 1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSettings({
            contact_email: data.contact_email,
            instagram_username: data.instagram_username.startsWith('@') ? data.instagram_username : `@${data.instagram_username}`,
            instagram_url: data.instagram_url,
            whatsapp_number: data.whatsapp_number,
            logo_url: data.logo_url
          });
          if (data.logo_url) {
            setLogoUrl(data.logo_url);
          }
        }
      } catch (err) {
        console.error("Error loading branding configurations inside footer layout:", err);
      }
    };
    fetchBrandingAndLinks();
  }, []);

  // Shared protection logic handler to block image asset download/drag events
  const preventDownloadAction = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="mt-24 border-t border-gold/40 bg-[color-mix(in_oklab,var(--maroon)_96%,black)] text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                /* ANTI-DOWNLOAD IMPLEMENTED: Disables right-clicks and image dragging */
                className="h-11 w-11 rounded-full object-cover border border-gold bg-white select-none pointer-events-none" 
                alt="Sri Sarvesan Branding Asset" 
                onContextMenu={preventDownloadAction}
                onDragStart={preventDownloadAction}
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold text-gold">
                <span className="font-display text-lg">॥</span>
              </span>
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-display tracking-[0.2em] text-ivory">SRI SARVESAN</span>
              <span className="font-serif text-[11px] uppercase tracking-[0.35em] text-gold">
                Arts
              </span>
            </div>
          </div>
          <p className="mt-4 font-serif text-sm text-ivory/70">
            Traditional South Indian devotional artistry — paintings crafted with
            heritage, patience, and prayer.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.3em] text-gold">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2 font-serif text-sm text-ivory/80">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/portfolio" className="hover:text-gold">Portfolio</Link></li>
            <li><Link to="/commissions" className="hover:text-gold">Commission an Artwork</Link></li>
            <li><Link to="/" hash="reviews" className="hover:text-gold">Devotee Experiences</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.3em] text-gold">
            Connect
          </h4>
          <ul className="mt-4 space-y-3 font-serif text-sm text-ivory/80">
            <li>
              <a 
                href={settings.instagram_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Instagram size={16} /> {settings.instagram_username}
              </a>
            </li>
            <li>
              <a 
                href={`mailto:${settings.contact_email}`} 
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <Mail size={16} /> {settings.contact_email}
              </a>
            </li>
            <li>
              <a 
                href={`https://wa.me/${settings.whatsapp_number}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-gold transition-colors"
              >
                <MessageSquare size={16} /> WhatsApp Only
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.3em] text-gold">
            Studio
          </h4>
          <p className="mt-4 font-serif text-sm text-ivory/70">
            By appointment only.<br />
            Salem Tamil Nadu, India.
          </p>
        </div>
      </div>

      <div className="border-t border-gold/25">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center md:flex-row md:text-left">
          <div className="flex flex-col items-center gap-2.5 md:items-start w-full md:w-auto">
            <Link 
              to="/admin" 
              className="font-serif text-xs tracking-[0.25em] uppercase text-ivory/60 hover:text-gold/80 transition-colors duration-200"
            >
              © {new Date().getFullYear()} Sri Sarvesan Arts
            </Link>

            {/* Preserved your beautiful custom badge container setup exactly as requested */}
            {/* Added dynamic touch device click response state ('active:scale-[0.99] touch-manipulation') */}
            <div className="group relative w-full max-w-full md:w-auto overflow-hidden rounded-full border border-gold/30 bg-gradient-to-r from-gold/[0.07] via-gold/[0.03] to-gold/[0.07] px-4 py-2 shadow-[0_0_0_1px_rgba(212,175,55,0.05)] transition-all duration-300 hover:border-gold/60 hover:shadow-[0_0_18px_-4px_rgba(212,175,55,0.45)] active:scale-[0.99] md:active:scale-100 touch-manipulation">
              {/* Subtle hover reflection sheen asset preserved untouched */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-gold/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

              <div className="relative flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-serif text-[11px] tracking-wide text-ivory/55 md:justify-start">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles size={11} className="shrink-0 text-gold" />
                  Designed &amp; developed by{" "}
                  <span className="font-display tracking-[0.04em] text-gold">Anandha Krishnan</span>
                </span>

                <span className="hidden text-gold/25 sm:inline">✦</span>

                <span className="whitespace-nowrap text-ivory/45">
                  Available for creating stunning portfolios &amp; websites
                </span>

                <span className="hidden text-gold/25 sm:inline">✦</span>

                <a
                  href="mailto:anandhperumal27@gmail.com"
                  className="flex items-center gap-1 whitespace-nowrap font-sans text-gold/90 transition-colors hover:text-gold hover:underline min-h-[28px] sm:min-h-0"
                >
                  <Mail size={11} className="shrink-0" /> anandhperumal27@gmail.com
                </a>

                <span className="hidden text-gold/25 sm:inline">✦</span>

                <a
                  href="https://wa.me/916383109049"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 whitespace-nowrap font-sans text-gold/90 transition-colors hover:text-gold hover:underline min-h-[28px] sm:min-h-0"
                >
                  <Phone size={11} className="shrink-0" /> +91 63831 09049
                </a>
              </div>
            </div>
          </div>
          
          <p className="font-serif text-xs italic tracking-widest text-gold shrink-0 mt-2 md:mt-0">
            Made with devotion.
          </p>
        </div>
      </div>
    </footer>
  );
}