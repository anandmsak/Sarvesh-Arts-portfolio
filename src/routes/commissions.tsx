import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const Route = createFileRoute('/commissions')({
  component: CommissionsPage,
});

interface CommissionFormInputs {
  name: string;
  email: string;
  phone: string;
  country: string;
  artworkType: string;
  deitySubject: string;
  preferredSize: string;
  medium: string;
  additionalRequirements: string;
}

function CommissionsPage() {
  const { register, handleSubmit, reset, setValue } = useForm<CommissionFormInputs>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CommissionFormInputs) => {
    setIsSubmitting(true);
    
    try {
      // NOTE: Replace 'YOUR_FORM_ID_HERE' with the unique ID provided by formspree.io
      const response = await fetch('https://formspree.io/f/xykqrryn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitting(false);
        setShowSuccess(true);
        reset();
      } else {
        alert("Something went wrong with the submission. Please try again or contact via Instagram.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Network error. Please check your internet connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border border-[#D4AF37]/30 bg-white shadow-xl">
          <CardHeader className="text-center border-b border-[#D4AF37]/10 pb-6">
            <CardTitle className="font-serif text-3xl text-[#800020] tracking-wide">
              Commission an Artwork
            </CardTitle>
            <CardDescription className="text-[#3D2B1F]/80 font-sans mt-2">
              Request a custom traditional Śrīvaiṣṇava or Śilpa Śāstra painting tailored precisely for your home or temple.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Personal Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#3D2B1F] font-medium">Full Name *</Label>
                  <Input id="name" required {...register('name')} className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#3D2B1F] font-medium">Email Address *</Label>
                  <Input id="email" type="email" required {...register('email')} className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#3D2B1F] font-medium">Phone / WhatsApp Number *</Label>
                  <Input id="phone" required {...register('phone')} placeholder="+91 ..." className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-[#3D2B1F] font-medium">Country *</Label>
                  <Input id="country" required {...register('country')} className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
              </div>

              <hr className="border-[#D4AF37]/20 my-4" />

              {/* Artwork Specs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-medium">Artwork Placement *</Label>
                  <Select required onValueChange={(val) => setValue('artworkType', val)}>
                    <SelectTrigger className="border-[#3D2B1F]/20">
                      <SelectValue placeholder="Select placement context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home Sanctum / Puja Room</SelectItem>
                      <SelectItem value="Temple">Temple / Devasthanam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deitySubject" className="text-[#3D2B1F] font-medium">Deity / Subject Description *</Label>
                  <Input id="deitySubject" required {...register('deitySubject')} placeholder="e.g., Lakshmi Hayavadhana" className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredSize" className="text-[#3D2B1F] font-medium">Preferred Dimensions / Size *</Label>
                  <Input id="preferredSize" required {...register('preferredSize')} placeholder="e.g., A3, 2x3 feet, Custom" className="border-[#3D2B1F]/20 focus-visible:ring-[#800020]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#3D2B1F] font-medium">Preferred Medium *</Label>
                  <Select required onValueChange={(val) => setValue('medium', val)}>
                    <SelectTrigger className="border-[#3D2B1F]/20">
                      <SelectValue placeholder="Select medium style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pen/Pencil Drawings">Pen / Pencil Drawing</SelectItem>
                      <SelectItem value="Acrylic Paintings">Acrylic Painting</SelectItem>
                      <SelectItem value="Temple Paintings">Traditional Temple Painting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload Placeholder */}
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-[#3D2B1F] font-medium">Reference Image (Optional)</Label>
                <Input id="reference" type="file" accept="image/*" className="border-[#3D2B1F]/20 cursor-pointer bg-[#FCFBF7]" />
              </div>

              {/* Requirements Area */}
              <div className="space-y-2">
                <Label htmlFor="additionalRequirements" className="text-[#3D2B1F] font-medium">Additional Requirements & Dhyana Sloka specifications</Label>
                <Textarea 
                  id="additionalRequirements" 
                  {...register('additionalRequirements')} 
                  placeholder="Describe specific postures, iconographic features, colors, or textual reference details you require..." 
                  className="border-[#3D2B1F]/20 min-h-[120px] focus-visible:ring-[#800020]"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#800020] hover:bg-[#600018] text-white font-serif tracking-wide py-6 text-lg rounded shadow-md border border-[#D4AF37]/40 transition-colors"
              >
                {isSubmitting ? 'Submitting Inquiry...' : 'Submit Commission Inquiry'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>

      {/* Traditional Success Modal */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="bg-[#FCFBF7] border border-[#D4AF37] max-w-md">
          <AlertDialogHeader className="text-center space-y-3">
            <AlertDialogTitle className="font-serif text-2xl text-[#800020]">
              Namaskāram 🙏
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#3D2B1F] text-base font-sans leading-relaxed">
              Thank you for your enquiry. Your commission request has been received successfully. 
              <br /><br />
              I will review your requirements and contact you via Email or WhatsApp within 2–3 working days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction className="bg-[#800020] hover:bg-[#600018] text-white px-8">
              Kritajnah (Close)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}