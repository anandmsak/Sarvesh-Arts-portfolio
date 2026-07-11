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
      
      {/* Smart Responsive Notification Ribbon for Mobile Views */}
      <div className="block lg:hidden mb-6 p-4 bg-[#800020]/10 border border-[#800020]/30 rounded text-xs font-serif leading-relaxed text-[#800020]">
        ✨ <span className="font-bold">Recommendation:</span> For configuring large artwork tables, structural data logs, and full studio media updates seamlessly, switching over to a desktop monitor or tablet landscape layout is highly recommended.
      </div>

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
          <TabsList className="bg-[#3D2B1F]/5 p-1 mb-6 border border-[#3D2B1F]/10 flex flex-wrap gap-2">
            <TabsTrigger value="inventory">Artworks Inventory</TabsTrigger>
            <TabsTrigger value="add-art">＋ Add Artwork</TabsTrigger>
            <TabsTrigger value="add-temple">＋ Add Temple Project</TabsTrigger>
            <TabsTrigger value="reviews">💬 Manage Reviews</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Studio Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-8">
            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Active Gallery Registry</CardTitle></CardHeader>
              <CardContent>
                {artworks.length === 0 ? (
                  <p className="text-sm text-center text-zinc-400 py-4">No active gallery pieces discovered inside storage registries.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artworks.map((art) => (
                        <TableRow key={art.id}>
                          <TableCell><img src={art.imageUrl} className="w-10 h-10 object-cover rounded bg-zinc-100" alt="" /></TableCell>
                          <TableCell className="font-bold text-[#800020]">{art.title}</TableCell>
                          <TableCell>{art.category}</TableCell>
                          <TableCell><Badge>{art.status}</Badge></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleSetHero(art.imageUrl)} className="border-[#D4AF37]">Set Hero</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteArtwork(art.id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Active Temple Commission Registry</CardTitle></CardHeader>
              <CardContent>
                {templeProjects.length === 0 ? (
                  <p className="text-sm text-center text-zinc-400 py-4">No logged temple records found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Location/Title</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templeProjects.map((proj) => (
                        <TableRow key={proj.id}>
                          <TableCell><img src={proj.imageUrl} className="w-12 h-10 object-cover rounded bg-zinc-100" alt="" /></TableCell>
                          <TableCell className="font-serif font-medium">{proj.title}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="destructive" onClick={() => deleteTempleProject(proj.id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-art">
            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Publish New Masterpiece</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={artworkForm.handleSubmit(onAddArtwork)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" required {...artworkForm.register('title')} />
                    </div>
                    <div className="space-y-1">
                      <Label>Category *</Label>
                      <Select required onValueChange={(val) => artworkForm.setValue('category', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Temple Paintings">Temple Paintings</SelectItem>
                          <SelectItem value="Pen/Pencil Drawings">Pen/Pencil Drawings</SelectItem>
                          <SelectItem value="Acrylic Paintings">Acrylic Paintings</SelectItem>
                          <SelectItem value="Work in Progress">Work in Progress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Medium (e.g., Ink)" required {...artworkForm.register('medium')} />
                    <Input placeholder="Dimensions" required {...artworkForm.register('dimensions')} />
                    <Input type="number" defaultValue={2026} required {...artworkForm.register('year', { valueAsNumber: true })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select required onValueChange={(val: any) => artworkForm.setValue('status', val)}>
                      <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Commissioned">Commissioned</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input id="artFile" type="file" required className="cursor-pointer" />
                  </div>
                  <Textarea placeholder="Description Details..." {...artworkForm.register('description')} />
                  <Textarea placeholder="Traditional Śilpa Śāstra Significance Rules..." {...artworkForm.register('traditionalSignificance')} />
                  <Button type="submit" className="bg-[#800020] text-white font-serif w-full">Deploy Artwork Online</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-temple">
            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Log Temple Murals & Commissions</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={templeForm.handleSubmit(onAddTemple)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Project Title / Shrine Location *" required {...templeForm.register('title')} />
                    <Input id="templeFile" type="file" required className="cursor-pointer" />
                  </div>
                  <Textarea placeholder="Describe the installation scope, iconography context, and community process..." required {...templeForm.register('description')} />
                  <Button type="submit" className="bg-[#800020] text-white font-serif w-full">Publish Temple Record</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8">
              <Card className="border border-[#D4AF37]/20 bg-white h-fit">
                <CardHeader>
                  <CardTitle className="font-serif text-[#800020]">Log Client Review / Screenshot</CardTitle>
                  <CardDescription>Upload WhatsApp feedback screenshots or log typed phone-call words.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={reviewForm.handleSubmit(onAddReview)} className="space-y-4">
                    <div className="space-y-1">
                      <Label>Client Name / Altar Location</Label>
                      <Input placeholder="e.g., Sridhar from Chennai" required {...reviewForm.register('client_name')} />
                    </div>
                    <div className="space-y-1">
                      <Label>Feedback Input Format</Label>
                      <Select value={selectedReviewType} onValueChange={(val: any) => setSelectedReviewType(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Text">Typed Text Quote (Direct/Call)</SelectItem>
                          <SelectItem value="Screenshot">WhatsApp Chat Screenshot Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedReviewType === 'Text' ? (
                      <div className="space-y-1">
                        <Label>Review Narrative Copy</Label>
                        <Textarea placeholder="Paste the feedback message or type their spoken statement directly here..." required rows={4} {...reviewForm.register('review_text')} />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Label>Select WhatsApp Screenshot Image File</Label>
                        <Input id="reviewFile" type="file" className="cursor-pointer bg-white" required />
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-[#800020] text-white font-serif">Publish Review Entry</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border border-[#D4AF37]/20 bg-white">
                <CardHeader><CardTitle className="font-serif text-[#800020]">Active Review Inventory</CardTitle></CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-sm text-center text-zinc-400 py-4">No logged client testimonials found in cloud storage buckets.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Content Preview</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((rev) => (
                          <TableRow key={rev.id}>
                            <TableCell className="font-serif font-bold text-primary">{rev.client_name}</TableCell>
                            <TableCell><Badge variant="outline">{rev.review_type}</Badge></TableCell>
                            <TableCell className="max-w-[15rem] truncate text-xs font-serif italic">
                              {rev.review_type === 'Text' ? rev.review_text : (
                                <img src={rev.image_url} className="w-12 h-10 object-cover border rounded" alt="" />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="destructive" onClick={() => deleteReview(rev.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border border-[#D4AF37]/20 bg-white">
              <CardHeader><CardTitle className="font-serif text-[#800020]">Global Profile & Brand Identity Customization</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={settingsForm.handleSubmit(onUpdateSettings)} className="space-y-6">
                  <div className="p-4 bg-zinc-50 rounded-sm border space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020]">🎨 Corporate Assets & Artist Portrait</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        {settings?.logo_url && (
                          <img src={settings.logo_url} className="h-12 w-12 object-cover rounded-full border border-gold/40 bg-white shrink-0" alt="" />
                        )}
                        <div className="space-y-1 w-full">
                          <Label htmlFor="logoFile">Upload Logo File</Label>
                          <Input id="logoFile" type="file" className="cursor-pointer bg-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {settings?.artist_image_url && (
                          <img src={settings.artist_image_url} className="h-12 w-12 object-cover rounded border border-gold/40 bg-white shrink-0" alt="" />
                        )}
                        <div className="space-y-1 w-full">
                          <Label htmlFor="artistFile">Upload Artist Image File</Label>
                          <Input id="artistFile" type="file" className="cursor-pointer bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-50 rounded-sm border space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020]">🔐 Security Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Change Admin Passkey</Label>
                        <Input type="text" {...settingsForm.register('admin_passkey')} required />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-sm border space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020]">📞 Channel Integrations & Routing Numbers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label>Studio Communication Email</Label>
                        <Input type="email" {...settingsForm.register('contact_email')} required />
                      </div>
                      <div className="space-y-1">
                        <Label>Instagram Username Display</Label>
                        <Input type="text" {...settingsForm.register('instagram_username')} required />
                      </div>
                      <div className="space-y-1">
                        <Label>Instagram Link URL</Label>
                        <Input type="url" {...settingsForm.register('instagram_url')} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>WhatsApp Target ID/Number</Label>
                        <Input type="text" {...settingsForm.register('whatsapp_number')} placeholder="e.g., 916374933410" required />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-sm border space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020]">🎨 Hero Section Headlines & Slogans</h3>
                    <div className="space-y-2">
                      <Label>Hero Section Main Title Statement</Label>
                      <Input {...settingsForm.register('hero_slogan_title')} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Section Sub-Paragraph Statement Context</Label>
                      <Textarea {...settingsForm.register('hero_slogan_sub')} rows={3} required />
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-sm border space-y-4">
                    <h3 className="font-serif font-bold text-sm text-[#800020]">📜 About Page Content Configuration</h3>
                    <div className="space-y-3">
                      <Label>Main Section Title Heading</Label>
                      <Input {...settingsForm.register('about_heading')} required />
                    </div>
                    <div className="space-y-3">
                      <Label>Biography Paragraph 1 (Introduction)</Label>
                      <Textarea {...settingsForm.register('about_p1')} rows={3} required />
                    </div>
                    <div className="space-y-3">
                      <Label>Biography Paragraph 2 (Specialization Details)</Label>
                      <Textarea {...settingsForm.register('about_p2')} rows={3} required />
                    </div>
                    <div className="space-y-3">
                      <Label>Core Devotional Philosophy Quote</Label>
                      <Textarea {...settingsForm.register('about_quote')} rows={3} required />
                    </div>
                    <div className="space-y-3">
                      <Label>Biography Paragraph 3 (Closing Vision)</Label>
                      <Textarea {...settingsForm.register('about_p3')} rows={3} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mission Statement</Label>
                        <Textarea {...settingsForm.register('about_mission')} rows={4} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Vision Statement</Label>
                        <Textarea {...settingsForm.register('about_vision')} rows={4} required />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif">
                    Save and Deploy Updates Globally
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={blocker.status === 'blocked'} onOpenChange={(open) => !open && blocker.reset?.()}>
        <DialogContent className="max-w-md bg-white border border-[#D4AF37]/40 shadow-2xl p-6 text-center rounded-md font-serif">
          <DialogHeader className="space-y-2 flex flex-col items-center justify-center text-center">
            <span className="font-display text-4xl text-gold block mx-auto">॥ ॐ ॥</span>
            <DialogTitle className="text-xl text-[#800020] text-center tracking-wide">Are you sure you want to quit the admin page?</DialogTitle>
            <DialogDescription className="text-xs text-[#3D2B1F]/70 text-center italic mt-2">
              Any unsaved adjustments made to settings profiles, artwork registries, or configuration panels will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row items-center justify-center gap-4 sm:justify-center w-full">
            <Button 
              variant="outline" 
              onClick={() => blocker.reset?.()} 
              className="border-[#3D2B1F]/30 hover:bg-zinc-50 font-serif px-6 py-2 tracking-wider text-xs uppercase text-[#3D2B1F]"
            >
              Stay Here
            </Button>
            <Button 
              onClick={() => blocker.proceed?.()} 
              className="bg-[#800020] hover:bg-[#600018] text-white font-serif px-6 py-2 tracking-wider text-xs uppercase"
            >
              Confirm Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}