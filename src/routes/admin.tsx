import React, { useState, useEffect } from 'react';
import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import emailjs from '@emailjs/browser';

type AdminSearch = {
  tab?: string;
};

export const Route = createFileRoute('/admin')({
  validateSearch: (search: Record<string, unknown>): AdminSearch => {
    return {
      tab: (search.tab as string) || 'inventory',
    };
  },
  component: AdminDashboardPage,
});

interface ArtworkData {
  id: string;
  title: string;
  category: string;
  medium: string;
  dimensions: string;
  year: number;
  description: string;
  traditionalSignificance: string;
  status: 'Available' | 'Commissioned' | 'Sold';
  imageUrl: string;
}

interface TempleProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface ReviewData {
  id: string;
  client_name: string;
  review_type: 'Text' | 'Screenshot';
  review_text?: string;
  image_url?: string;
}

interface StudioSettings {
  admin_passkey: string;
  contact_email: string;
  instagram_username: string;
  instagram_url: string;
  whatsapp_number: string;
  hero_slogan_title: string;
  hero_slogan_sub: string;
  logo_url: string;
  artist_image_url: string;
  about_heading: string;
  about_p1: string;
  about_p2: string;
  about_quote: string;
  about_p3: string;
  about_mission: string;
  about_vision: string;
}

function AdminDashboardPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = search.tab || 'inventory';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [currentPasskey, setCurrentPasskey] = useState<string>('SarvesanArts2026');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [templeProjects, setTempleProjects] = useState<TempleProject[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [selectedReviewType, setSelectedReviewType] = useState<'Text' | 'Screenshot'>('Text');
  
  const artworkForm = useForm<Omit<ArtworkData, 'id' | 'imageUrl'>>();
  const templeForm = useForm<Omit<TempleProject, 'id' | 'imageUrl'>>();
  const reviewForm = useForm<{ client_name: string; review_text?: string }>();
  const settingsForm = useForm<Omit<StudioSettings, 'logo_url' | 'artist_image_url'>>();

  const blocker = useBlocker({
    shouldBlockFn: ({ next }) => {
      if (!isAuthenticated) return false;
      return !next.pathname.startsWith('/admin');
    },
    withResolver: true,
  });

  useEffect(() => {
    const fetchPasskeyOnly = async () => {
      const { data } = await supabase.from('studio_settings').select('admin_passkey').eq('id', 1).single();
      if (data?.admin_passkey) {
        setCurrentPasskey(data.admin_passkey);
      }
    };
    fetchPasskeyOnly();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === currentPasskey) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Secure Passkey. Access Denied.');
    }
  };

  const fetchLiveRegistryData = async () => {
    try {
      const { data: artData, error: artErr } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (artErr) throw artErr;
      if (artData) {
        setArtworks(artData.map((art: any) => ({
          id: art.id,
          title: art.title,
          category: art.category,
          medium: art.medium,
          dimensions: art.dimensions,
          year: art.year,
          description: art.description || '',
          traditionalSignificance: art.traditional_significance || '',
          status: art.status,
          imageUrl: art.image_url
        })));
      }

      const { data: templeData, error: templeErr } = await supabase
        .from('temple_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (templeErr) throw templeErr;
      if (templeData) {
        setTempleProjects(templeData.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          imageUrl: t.image_url
        })));
      }

      const { data: reviewData, error: revErr } = await supabase
        .from('studio_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (revErr) throw revErr;
      if (reviewData) {
        setReviews(reviewData);
      }

      const { data: settingsData } = await supabase
        .from('studio_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (settingsData) {
        setSettings(settingsData);
        settingsForm.reset(settingsData);
        setCurrentPasskey(settingsData.admin_passkey);
      }

    } catch (err: any) {
      console.error("Database connection broken exception:", err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveRegistryData();
    }
  }, [isAuthenticated]);

  const onTabChangeHandler = (nextTab: string) => {
    navigate({
      search: (prev) => ({ ...prev, tab: nextTab }),
      replace: true,
    });
  };

  const onAddArtwork = async (data: Omit<ArtworkData, 'id' | 'imageUrl'>) => {
    const fileInput = document.getElementById('artFile') as HTMLInputElement;
    if (!fileInput?.files || fileInput.files.length === 0) {
      alert("Please select an artwork file image first.");
      return;
    }

    const file = fileInput.files[0];
    const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;
    const filePath = `artworks/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('artworks').insert([{
        title: data.title,
        category: data.category,
        medium: data.medium,
        dimensions: data.dimensions,
        year: data.year,
        description: data.description,
        traditional_significance: data.traditionalSignificance,
        status: data.status,
        image_url: publicUrl
      }]);

      if (dbError) throw dbError;

      alert("Masterpiece cleanly deployed to Cloud Database successfully!");
      artworkForm.reset();
      fileInput.value = '';
      fetchLiveRegistryData();
    } catch (error: any) {
      alert(`Upload transaction failure: ${error.message}`);
    }
  };

  const onAddTemple = async (data: Omit<TempleProject, 'id' | 'imageUrl'>) => {
    const fileInput = document.getElementById('templeFile') as HTMLInputElement;
    if (!fileInput?.files || fileInput.files.length === 0) {
      alert("Please select a project installation photo first.");
      return;
    }

    const file = fileInput.files[0];
    const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;
    const filePath = `temples/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('temple_projects').insert([{
        title: data.title,
        description: data.description,
        image_url: publicUrl
      }]);

      if (dbError) throw dbError;

      alert("Temple Project successfully saved permanently!");
      templeForm.reset();
      fileInput.value = '';
      fetchLiveRegistryData();
    } catch (error: any) {
      alert(`Project upload transaction failure: ${error.message}`);
    }
  };

  const onAddReview = async (data: { client_name: string; review_text?: string }) => {
    const fileInput = document.getElementById('reviewFile') as HTMLInputElement;
    let computedImageUrl = '';

    try {
      if (selectedReviewType === 'Screenshot') {
        if (!fileInput?.files || fileInput.files.length === 0) {
          alert("Please select a WhatsApp screenshot image file first.");
          return;
        }
        const file = fileInput.files[0];
        const fileName = `${Math.random().toString(36).substring(2)}_${file.name}`;
        const filePath = `reviews/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
        computedImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from('studio_reviews').insert([{
        client_name: data.client_name,
        review_type: selectedReviewType,
        review_text: selectedReviewType === 'Text' ? data.review_text : null,
        image_url: selectedReviewType === 'Screenshot' ? computedImageUrl : null
      }]);

      if (dbError) throw dbError;

      alert("Review configuration successfully recorded!");
      reviewForm.reset();
      if (fileInput) fileInput.value = '';
      fetchLiveRegistryData();
    } catch (error: any) {
      alert(`Review upload transaction break: ${error.message}`);
    }
  };

  const onUpdateSettings = async (data: Omit<StudioSettings, 'logo_url' | 'artist_image_url'>) => {
    const logoInput = document.getElementById('logoFile') as HTMLInputElement;
    const artistInput = document.getElementById('artistFile') as HTMLInputElement;
    
    let computedLogoUrl = settings?.logo_url || '';
    let computedArtistUrl = settings?.artist_image_url || '';

    try {
      if (logoInput?.files && logoInput.files.length > 0) {
        const file = logoInput.files[0];
        const fileName = `brand/logo_${Math.random().toString(36).substring(2)}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
        computedLogoUrl = publicUrl;
      }

      if (artistInput?.files && artistInput.files.length > 0) {
        const file = artistInput.files[0];
        const fileName = `brand/artist_${Math.random().toString(36).substring(2)}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
        computedArtistUrl = publicUrl;
      }

      const { error } = await supabase
        .from('studio_settings')
        .update({
          ...data,
          logo_url: computedLogoUrl,
          artist_image_url: computedArtistUrl
        })
        .eq('id', 1);

      if (error) throw error;
      alert("Studio settings updated successfully!");
      if (logoInput) logoInput.value = '';
      if (artistInput) artistInput.value = '';
      fetchLiveRegistryData();
    } catch (error: any) {
      alert(`Settings saving broken: ${error.message}`);
    }
  };

  const deleteArtwork = async (id: string) => {
    if (!confirm("Delete this artwork entry forever?")) return;
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id);
      if (error) throw error;
      fetchLiveRegistryData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteTempleProject = async (id: string) => {
    if (!confirm("Delete this temple installation entry forever?")) return;
    try {
      const { error } = await supabase.from('temple_projects').delete().eq('id', id);
      if (error) throw error;
      fetchLiveRegistryData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Completely wipe this devotee review record forever?")) return;
    try {
      const { error } = await supabase.from('studio_reviews').delete().eq('id', id);
      if (error) throw error;
      fetchLiveRegistryData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSetHero = async (url: string) => {
    try {
      const { error } = await supabase
        .from('studio_settings')
        .update({ hero_image_url: url })
        .eq('id', 1);

      if (error) throw error;
      alert('Masterpiece successfully assigned as main landing background asset globally!');
    } catch (err: any) {
      alert(`Error setting hero asset: ${err.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (isSendingEmail) return;
    
    const backupEmailInput = prompt("Enter your registered admin contact email to request passkey recovery:");
    if (!backupEmailInput) return;

    setIsSendingEmail(true);

    try {
      emailjs.init('RdtmhHIbJ0xmCNp3X');

      const { data, error } = await supabase
        .from('studio_settings')
        .select('contact_email, admin_passkey')
        .eq('id', 1)
        .single();

      if (error || !data) throw new Error("Could not retrieve studio verification records.");

      if (backupEmailInput.trim().toLowerCase() === data.contact_email.trim().toLowerCase()) {
        await emailjs.send(
          'service_qgmn21t',
          'template_2rwa1i7',
          {
            passkey: data.admin_passkey,
            to_email: data.contact_email
          }
        );

        alert("Verification Initialized! The passkey has been securely sent directly to your registered email address.");
      } else {
        alert("Identity verification failed. The provided email address is unauthorized.");
      }
    } catch (err: any) {
      const errorText = err?.text || err?.message || JSON.stringify(err);
      alert(`Transmission issue encountered: ${errorText}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-[#D4AF37]/40 bg-white p-6 shadow-xl text-center">
          <CardHeader className="space-y-2">
            <span className="font-display text-4xl text-gold block">॥ ॐ ॥</span>
            <CardTitle className="font-serif text-2xl text-[#800020] tracking-wide">Studio CMS Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-2">
              <div className="space-y-2 text-left">
                <Label htmlFor="passkey" className="font-serif text-[#3D2B1F]/80">Admin Passkey</Label>
                <Input 
                  id="passkey" 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="border-[#D4AF37]/30 focus-visible:ring-[#800020]"
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-widest uppercase text-xs py-5">
                Verify Identity
              </Button>
            </form>
            <button 
              type="button" 
              onClick={handleForgotPassword}
              disabled={isSendingEmail}
              className="mt-4 text-xs font-serif italic text-[#3D2B1F]/50 hover:text-[#800020] underline transition-colors disabled:opacity-50"
            >
              {isSendingEmail ? "Dispatched transmission processing..." : "Forgot Admin Passkey?"}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] p-4 sm:p-10 text-[#3D2B1F]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#D4AF37]/30 pb-6 gap-4">
          <div>
            <h1 className="font-serif text-3xl text-[#800020] tracking-wide">Studio Management Control</h1>
            <p className="text-[#3D2B1F]/70 text-sm mt-1">Configure brand assets, inventory portfolios, and client reviews logs dynamically.</p>
          </div>
          <Badge variant="outline" className="border-[#800020] text-[#800020] bg-white px-3 py-1 text-sm font-sans font-medium">
            Authorized CMS Workspace
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChangeHandler} className="w-full">
          {/* MOBILE OPTIMIZED: Scrolling tab bar setup preventing squish breakages */}
          <TabsList className="w-full bg-[#3D2B1F]/5 p-1 mb-6 border border-[#3D2B1F]/10 flex flex-nowrap overflow-x-auto justify-start scrollbar-none snap-x gap-1 h-auto min-h-11">
            <TabsTrigger value="inventory" className="snap-start whitespace-nowrap px-4 py-2 text-xs sm:text-sm">Artworks Inventory</TabsTrigger>
            <TabsTrigger value="add-art" className="snap-start whitespace-nowrap px-4 py-2 text-xs sm:text-sm">＋ Add Artwork</TabsTrigger>
            <TabsTrigger value="add-temple" className="snap-start whitespace-nowrap px-4 py-2 text-xs sm:text-sm">＋ Add Temple Project</TabsTrigger>
            <TabsTrigger value="reviews" className="snap-start whitespace-nowrap px-4 py-2 text-xs sm:text-sm">💬 Manage Reviews</TabsTrigger>
            <TabsTrigger value="settings" className="snap-start whitespace-nowrap px-4 py-2 text-xs sm:text-sm">⚙️ Studio Settings</TabsTrigger>
          </TabsList>

          {/* TAB 1: Inventory List View */}
          <TabsContent value="inventory" className="space-y-8">
            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Active Gallery Registry</CardTitle></CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <p className="text-sm text-center text-zinc-400 py-4">No active gallery pieces discovered inside storage registries.</p>
                ) : (
                  /* MOBILE OPTIMIZED: Responsive horizontal viewport wrapper scrolling container */
                  <div className="w-full overflow-x-auto rounded-md border border-zinc-100">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Preview</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {artworks.map((art) => (
                          <TableRow key={art.id}>
                            <TableCell>
                              <img src={art.imageUrl} className="w-10 h-10 object-cover rounded bg-zinc-50 select-none pointer-events-none" alt="" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                            </TableCell>
                            <TableCell className="font-bold text-[#800020] whitespace-nowrap">{art.title}</TableCell>
                            <TableCell className="whitespace-nowrap">{art.category}</TableCell>
                            <TableCell>
                              <Badge variant={art.status === 'Available' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider px-2 py-0.5">
                                {art.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2 whitespace-nowrap">
                              <Button variant="outline" size="sm" onClick={() => handleSetHero(art.imageUrl)} className="text-xs border-[#D4AF37] text-gold hover:bg-gold/10">Set Hero</Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteArtwork(art.id)} className="text-xs">Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Active Temple Commission Registry</CardTitle></CardHeader>
              <CardContent>
                {templeProjects.length === 0 ? (
                  <p className="text-sm text-center text-zinc-400 py-4">No active temple installation project files logged.</p>
                ) : (
                  /* MOBILE OPTIMIZED: Scroll layer isolation wrapper */
                  <div className="w-full overflow-x-auto rounded-md border border-zinc-100">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Image</TableHead>
                          <TableHead>Project Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templeProjects.map((proj) => (
                          <TableRow key={proj.id}>
                            <TableCell>
                              <img src={proj.imageUrl} className="w-10 h-10 object-cover rounded bg-zinc-50 select-none pointer-events-none" alt="" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                            </TableCell>
                            <TableCell className="font-bold text-[#800020] whitespace-nowrap">{proj.title}</TableCell>
                            <TableCell className="max-w-xs truncate text-zinc-600">{proj.description}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <Button variant="destructive" size="sm" onClick={() => deleteTempleProject(proj.id)} className="text-xs">Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Add Artwork Form */}
          <TabsContent value="add-art">
            <Card className="border border-[#D4AF37]/20 bg-white max-w-2xl mx-auto">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Publish New Masterpiece Entry</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={artworkForm.handleSubmit(onAddArtwork)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Artwork Title</Label>
                      <Input id="title" {...artworkForm.register('title')} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="e.g. Temple Paintings, Pen/Pencil Drawings" {...artworkForm.register('category')} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medium">Medium</Label>
                      <Input id="medium" placeholder="e.g. Natural Pigments on Canvas" {...artworkForm.register('medium')} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input id="dimensions" placeholder="e.g. 24 x 36 inches" {...artworkForm.register('dimensions')} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Creation Year</Label>
                      <Input id="year" type="number" defaultValue={2026} {...artworkForm.register('year', { valueAsNumber: true })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Collection Status</Label>
                      <select id="status" {...artworkForm.register('status')} className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]">
                        <option value="Available">Available</option>
                        <option value="Commissioned">Commissioned</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Creative Narrative Description</Label>
                    <Textarea id="description" {...artworkForm.register('description')} rows={3} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traditionalSignificance">Traditional Iconographic Significance</Label>
                    <Textarea id="traditionalSignificance" {...artworkForm.register('traditionalSignificance')} rows={3} required />
                  </div>
                  <div className="space-y-2 border-t border-zinc-100 pt-4">
                    <Label htmlFor="artFile" className="text-gold font-bold">Upload Source Master Image Asset</Label>
                    <Input id="artFile" type="file" accept="image/*" className="cursor-pointer" required />
                  </div>
                  <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-wider uppercase text-xs py-5 mt-2">Publish Asset Records</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Add Temple Project Form */}
          <TabsContent value="add-temple">
            <Card className="border border-[#D4AF37]/20 bg-white max-w-2xl mx-auto">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Archive Installation Log Record</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={templeForm.handleSubmit(onAddTemple)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tTitle">Project / Temple Title Name</Label>
                    <Input id="tTitle" {...templeForm.register('title')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tDesc">Structural Installation Narrative</Label>
                    <Textarea id="tDesc" {...templeForm.register('description')} rows={4} required />
                  </div>
                  <div className="space-y-2 border-t border-zinc-100 pt-4">
                    <Label htmlFor="templeFile" className="text-gold font-bold">Upload Installation Image</Label>
                    <Input id="templeFile" type="file" accept="image/*" className="cursor-pointer" required />
                  </div>
                  <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-wider uppercase text-xs py-5 mt-2">Save Temple Record</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Manage Client Reviews Logs */}
          <TabsContent value="reviews" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
              <Card className="border border-[#D4AF37]/20 bg-white">
                <CardHeader><CardTitle className="font-serif text-[#800020]">Log Client Appreciations</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={reviewForm.handleSubmit(onAddReview)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Feedback Asset Presentation Blueprint Type</Label>
                      <div className="flex gap-4 border border-zinc-100 p-2 rounded bg-zinc-50/50">
                        <label className="flex items-center gap-2 text-sm font-serif cursor-pointer">
                          <input type="radio" name="revType" checked={selectedReviewType === 'Text'} onChange={() => setSelectedReviewType('Text')} className="accent-[#800020]" />
                          Text Message Devotion
                        </label>
                        <label className="flex items-center gap-2 text-sm font-serif cursor-pointer">
                          <input type="radio" name="revType" checked={selectedReviewType === 'Screenshot'} onChange={() => setSelectedReviewType('Screenshot')} className="accent-[#800020]" />
                          WhatsApp Conversation File
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Devotee / Client Name Reference</Label>
                      <Input id="clientName" {...reviewForm.register('client_name')} required />
                    </div>
                    {selectedReviewType === 'Text' ? (
                      <div className="space-y-2">
                        <Label htmlFor="reviewText">Testimonial Text Context Message</Label>
                        <Textarea id="reviewText" {...reviewForm.register('review_text')} rows={4} placeholder="Type the review text exactly..." required />
                      </div>
                    ) : (
                      <div className="space-y-2 border-t border-zinc-100 pt-4">
                        <Label htmlFor="reviewFile" className="text-gold font-bold">Select Conversation Screenshot Upload</Label>
                        <Input id="reviewFile" type="file" accept="image/*" className="cursor-pointer" required />
                      </div>
                    )}
                    <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-wider uppercase text-xs py-5 mt-2">Record Review Log</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border border-[#D4AF37]/20 bg-white">
                <CardHeader><CardTitle className="font-serif text-[#800020]">Stored Testimonials Registry</CardTitle></CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-center text-zinc-400 py-4">No logged devotee feedback entries detected inside database pipelines.</p>
                  ) : (
                    /* MOBILE OPTIMIZED: Protected row container view layer block */
                    <div className="w-full overflow-x-auto rounded-md border border-zinc-100">
                      <Table className="min-w-[450px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Presentation Type</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reviews.map((rev) => (
                            <TableRow key={rev.id}>
                              <TableCell className="font-bold text-[#800020] whitespace-nowrap">{rev.client_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px] tracking-wider uppercase border-zinc-300">
                                  {rev.review_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button variant="destructive" size="sm" onClick={() => deleteReview(rev.id)} className="text-xs">Wipe Record</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 5: Live Studio Layout Global Controls Settings */}
          <TabsContent value="settings">
            <Card className="border border-[#D4AF37]/20 bg-white max-w-3xl mx-auto">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Global Branding &amp; Typography Identity Settings</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={settingsForm.handleSubmit(onUpdateSettings)} className="space-y-6">
                  <div className="p-4 bg-amber-50/50 border border-[#D4AF37]/20 rounded-md space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-gold/20 pb-1">🔐 Master Access Configuration</h3>
                    <div className="space-y-2">
                      <Label htmlFor="admin_passkey">Secure Control Dashboard CMS Passkey Token</Label>
                      <Input id="admin_passkey" {...settingsForm.register('admin_passkey')} required />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-gold/20 pb-1">📞 Studio Communication Pipelines Links</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Public Contact Email</Label>
                        <Input id="contact_email" {...settingsForm.register('contact_email')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram_username">Instagram Handle Badge</Label>
                        <Input id="instagram_username" placeholder="@srisarvesanarts" {...settingsForm.register('instagram_username')} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Direct Instagram URL link</Label>
                        <Input id="instagram_url" {...settingsForm.register('instagram_url')} required />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <Label htmlFor="whatsapp_number">WhatsApp Phone (With Country Code)</Label>
                      <Input id="whatsapp_number" placeholder="e.g. 916374933410" {...settingsForm.register('whatsapp_number')} required />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-gold/20 pb-1">🎨 Landing Hero Slogan Scriptor Lines</h3>
                    <div className="space-y-2">
                      <Label htmlFor="hero_slogan_title">Main Hero Banner Heading Title</Label>
                      <Input id="hero_slogan_title" {...settingsForm.register('hero_slogan_title')} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero_slogan_sub">Main Hero Explanatory Subtext Paragraph</Label>
                      <Textarea id="hero_slogan_sub" {...settingsForm.register('hero_slogan_sub')} rows={3} required />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-gold/20 pb-1">🕉️ About Page Scriptural Narrative Context</h3>
                    <div className="space-y-2">
                      <Label htmlFor="about_heading">Main Biography Chapter Heading</Label>
                      <Input id="about_heading" {...settingsForm.register('about_heading')} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="about_p1">Biography Narrative Paragraph Line 1</Label>
                        <Textarea id="about_p1" {...settingsForm.register('about_p1')} rows={4} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about_p2">Biography Narrative Paragraph Line 2</Label>
                        <Textarea id="about_p2" {...settingsForm.register('about_p2')} rows={4} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about_quote">Featured Devotional Callout Quote Block</Label>
                      <Textarea id="about_quote" {...settingsForm.register('about_quote')} rows={3} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about_p3">Concluding Heritage Philosophy Paragraph Line 3</Label>
                      <Textarea id="about_p3" {...settingsForm.register('about_p3')} rows={3} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="about_mission">Studio Mission Declaration</Label>
                        <Textarea id="about_mission" {...settingsForm.register('about_mission')} rows={3} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about_vision">Studio Vision Declaration</Label>
                        <Textarea id="about_vision" {...settingsForm.register('about_vision')} rows={3} required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-4 bg-zinc-50 p-4 rounded-md">
                    <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-gold/10 pb-1 text-gold">🖼️ Core Graphics Identity Image Files Updates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="logoFile" className="text-xs font-bold text-zinc-600">Studio Header Round Logo Branding Asset</Label>
                        <Input id="logoFile" type="file" accept="image/*" className="cursor-pointer bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="artistFile" className="text-xs font-bold text-zinc-600">About Narrative Section Artist Portrait Asset</Label>
                        <Input id="artistFile" type="file" accept="image/*" className="cursor-pointer bg-white" />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-wider uppercase text-xs py-5">
                    Save Global Control Configurations
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Blocker Confirmation Popup Modal Dialog */}
      <Dialog open={blocker.state === 'blocked'} onOpenChange={(o) => !o && blocker.reset?.()}>
        <DialogContent className="border-gold/30 bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#800020]">Exit Authorized Workspace Area?</DialogTitle>
            <DialogDescription className="font-serif mt-2">
              Leaving the dashboard locks active communication lines pipelines. Ensure settings are saved before exiting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => blocker.reset?.()} className="font-serif">Stay Inside Dashboard</Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()} className="font-serif">Confirm Disconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
