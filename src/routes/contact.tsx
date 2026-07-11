import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Instagram, Mail, MessageSquare, MapPin, Clock, Send } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

interface StudioSettings {
  contact_email: string;
  instagram_username: string;
  instagram_url: string;
  whatsapp_number: string;
}

function ContactPage() {
  const [settings, setSettings] = useState<StudioSettings>({
    contact_email: "srisarvesanarts@gmail.com",
    instagram_username: "@srisarvesanarts",
    instagram_url: "https://www.instagram.com/sri_sarvesan_arts",
    whatsapp_number: "916374933410"
  });

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const { data } = await supabase
          .from('studio_settings')
          .select('contact_email, instagram_username, instagram_url, whatsapp_number')
          .eq('id', 1)
          .single();
          
        if (data) {
          setSettings({
            contact_email: data.contact_email,
            instagram_username: data.instagram_username.startsWith('@') ? data.instagram_username : `@${data.instagram_username}`,
            instagram_url: data.instagram_url,
            whatsapp_number: data.whatsapp_number
          });
        }
      } catch (err) {
        console.error("Error pulling contact card properties:", err);
      }
    };
    fetchContactDetails();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Log messages straight into a new 'inquiries' table if you want to track them in Supabase later,
      // or redirect them cleanly to his professional email window handler:
      const mailtoUrl = `mailto:${settings.contact_email}?subject=${encodeURIComponent(subject || "Sacred Commission Inquiry")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoUrl;

      alert("Opening your secure local mail application client to process this inquiry submission offering!");
      
      // Reset state inputs
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      {/* Header Banner Zone */}
      <section className="relative bg-[color-mix(in_oklab,var(--ivory)_97%,var(--gold))] py-20 text-center border-b border-gold/20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">Get In Touch</p>
          <h1 className="mt-4 font-display text-5xl text-primary md:text-6xl tracking-wide">Contact</h1>
          <div className="gold-divider mx-auto mt-6 max-w-xs" aria-hidden>✦</div>
          <p className="mt-6 font-serif text-base italic leading-relaxed text-foreground/75">
            For enquiries, collaborations and studio visits — we would be honoured to hear from you.
          </p>
        </div>
      </section>

      {/* Main Structural Layout Block */}
      <section className="py-20 bg-[#FCFBF7]">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          
          {/* Column 1: Info Cards Context */}
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-md border border-gold/30 bg-white p-8 shadow-[0_1px_3px_rgba(212,175,55,0.1)]">
              <h3 className="font-display text-xl text-[#800020] tracking-wide mb-6">Studio Channels</h3>
              
              <div className="space-y-6">
                <a 
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 rounded hover:bg-[#FCFBF7] transition duration-200 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-gold text-gold bg-background shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-primary">WhatsApp Concierge</h4>
                    <p className="font-serif text-xs text-muted-foreground mt-0.5">Instant messaging assistance response routing.</p>
                    <p className="font-sans text-xs text-gold font-medium mt-1 group-hover:underline">Message Studio Only</p>
                  </div>
                </a>

                <a 
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-start gap-4 p-3 rounded hover:bg-[#FCFBF7] transition duration-200 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-gold text-gold bg-background shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-primary">Email Dispatch</h4>
                    <p className="font-serif text-xs text-muted-foreground mt-0.5">Formal acquisition paperwork log storage entries.</p>
                    <p className="font-sans text-xs text-gold font-medium mt-1 group-hover:underline">{settings.contact_email}</p>
                  </div>
                </a>

                <a 
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 p-3 rounded hover:bg-[#FCFBF7] transition duration-200 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-gold text-gold bg-background shrink-0">
                    <Instagram size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-primary">Instagram Visual Portfolio</h4>
                    <p className="font-serif text-xs text-muted-foreground mt-0.5">Behind-the-scenes stroke progression records.</p>
                    <p className="font-sans text-xs text-gold font-medium mt-1 group-hover:underline">{settings.instagram_username}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-md border border-gold/30 bg-white p-8 space-y-5">
              <h3 className="font-display text-xl text-primary tracking-wide">Visit Guidelines</h3>
              <div className="flex gap-3 text-sm font-serif">
                <MapPin className="text-gold shrink-0 mt-0.5" size={18} />
                <p className="text-foreground/80">Salem Tamil Nadu, India</p>
              </div>
              <div className="flex gap-3 text-sm font-serif border-t border-gold/10 pt-4">
                <Clock className="text-gold shrink-0 mt-0.5" size={18} />
                <p className="text-foreground/75 italic">
                  By formal appointment reservation booking parameters only. Every stroke is created within dedicated hours of silent, meditative runtime operations.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Premium Live Interaction Form */}
          <div className="rounded-md border border-gold/40 bg-white p-8 sm:p-10 shadow-lg animate-scale-in">
            <h3 className="font-display text-2xl text-[#800020] tracking-wide mb-2">Send an Inquiry</h3>
            <p className="font-serif text-xs italic text-muted-foreground mb-6">Let us prepare a traditional configuration response for your altar or mandapam space.</p>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-serif text-xs uppercase tracking-wider text-primary">Your Name *</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                    className="border-gold/30 bg-[#FCFBF7]/50 focus-visible:ring-gold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-serif text-xs uppercase tracking-wider text-primary">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="border-gold/30 bg-[#FCFBF7]/50 focus-visible:ring-gold" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="font-serif text-xs uppercase tracking-wider text-primary">Subject Matter</Label>
                <Input 
                  id="subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Altar Iconography Commission, Mural request"
                  className="border-gold/30 bg-[#FCFBF7]/50 focus-visible:ring-gold" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="font-serif text-xs uppercase tracking-wider text-primary">Message Details *</Label>
                <Textarea 
                  id="message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required 
                  rows={5} 
                  placeholder="Describe your requested iconography configurations, mudra shapes, preferred metrics dimensions, or specific installation timeline intentions..."
                  className="border-gold/30 bg-[#FCFBF7]/50 focus-visible:ring-gold leading-relaxed" 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-maroon-deep text-primary-foreground font-serif tracking-[0.25em] uppercase py-6 transition duration-300"
              >
                {isSubmitting ? "Processing..." : (
                  <span className="flex items-center justify-center gap-2">
                    Submit Inquiry <Send size={14} />
                  </span>
                )}
              </Button>
            </form>
          </div>

        </div>
      </section>
    </SiteLayout>
  );
}