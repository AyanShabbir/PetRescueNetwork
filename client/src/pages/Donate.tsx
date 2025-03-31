import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import { Shelter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DollarSign, Heart, Building2, HandHeart, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function Donate() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Parse shelter ID from URL if present
  const params = new URLSearchParams(location.split('?')[1] || '');
  const initialShelterId = params.get('shelter') ? parseInt(params.get('shelter')!) : undefined;

  // State for donation form
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [shelterId, setShelterId] = useState<number | undefined>(initialShelterId);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch all shelters
  const { data: shelters, isLoading: isLoadingShelters } = useQuery<Shelter[]>({
    queryKey: ['/api/shelters'],
  });

  // Handle preset donation amounts
  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  // Handle custom donation amount
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setCustomAmount(value);
      if (value) {
        setAmount(parseFloat(value));
      } else {
        setAmount(0);
      }
    }
  };

  // Handle shelter selection
  const handleShelterChange = (value: string) => {
    setShelterId(value ? parseInt(value) : undefined);
  };

  // Handle donation submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const donationData = {
        amount: Math.round(amount * 100), // Convert to cents for storage
        shelter_id: shelterId,
        user_id: user?.id,
        message: message
      };
      
      await apiRequest("POST", "/api/donations", donationData);
      
      // Show success message
      setIsSuccess(true);
      
      // Reset form
      setAmount(50);
      setCustomAmount("");
      setMessage("");
      
      // Invalidate cached donation data if needed
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/donations/user'] });
      }
      if (shelterId) {
        queryClient.invalidateQueries({ queryKey: [`/api/donations/shelter/${shelterId}`] });
      }
      
      toast({
        title: "Donation successful",
        description: "Thank you for your generous donation!",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Donation failed",
        description: "There was a problem processing your donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          {isSuccess ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mb-2">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-center text-2xl">Thank You for Your Donation!</CardTitle>
                <CardDescription className="text-center text-base">
                  Your generosity helps animals find their forever homes.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p>Your donation has been successfully processed. A confirmation email will be sent to your registered email address.</p>
                <p className="font-medium">Together, we're making a difference in the lives of pets in need.</p>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button onClick={() => setIsSuccess(false)}>Make Another Donation</Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Return Home
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">Support Our Animal Rescue Efforts</h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Your donations help provide food, shelter, medical care, and love to animals in need.
                  Every contribution makes a difference in the lives of our rescue animals.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <Building2 className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Shelter Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      Help maintain shelter facilities and provide basic necessities for animals awaiting adoption.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <HandHeart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Medical Care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      Fund veterinary care, medications, surgeries, and preventative treatments for rescue animals.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <Heart className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Special Programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      Support our specialized programs for senior pets, behavioral training, and community outreach.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Donation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                  <CardDescription>
                    Fill out the form below to make a secure donation to support our animal rescue efforts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select a Shelter (Optional)
                      </label>
                      <Select 
                        value={shelterId?.toString() || ""} 
                        onValueChange={handleShelterChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Shelters (General Fund)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Shelters (General Fund)</SelectItem>
                          {isLoadingShelters ? (
                            <SelectItem value="" disabled>Loading shelters...</SelectItem>
                          ) : (
                            shelters?.map(shelter => (
                              <SelectItem key={shelter.id} value={shelter.id.toString()}>
                                {shelter.name} - {shelter.city}, {shelter.state}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Donation Amount
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[25, 50, 100, 250, 500, 1000].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={amount === value && !customAmount ? "default" : "outline"}
                            onClick={() => handleAmountSelect(value)}
                          >
                            ${value}
                          </Button>
                        ))}
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
                        <Input
                          type="text"
                          placeholder="Custom Amount"
                          className="pl-10"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Message (Optional)
                      </label>
                      <Textarea
                        placeholder="Include a message with your donation"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Donor Information
                      </label>
                      {user ? (
                        <div className="bg-neutral-50 p-4 rounded-md">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-neutral-600">{user.email}</p>
                          <p className="text-neutral-600">{user.phone || 'No phone number provided'}</p>
                        </div>
                      ) : (
                        <div className="bg-neutral-50 p-4 rounded-md">
                          <p className="mb-2">You are donating as a guest. <a href="/login" className="text-primary hover:underline">Log in</a> to receive donation receipts and track your contributions.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input placeholder="Name" />
                            <Input placeholder="Email" type="email" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : `Donate $${amount || 0}`}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-neutral-500">
                  <p>All donations are tax-deductible. You will receive a receipt via email.</p>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
