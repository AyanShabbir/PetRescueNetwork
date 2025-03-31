import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import { Pet, Shelter } from "@shared/schema";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  Share, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PetDetails() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, params] = useRoute<{ id: string }>("/pet/:id");
  
  const petId = params ? parseInt(params.id) : null;
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [adoptionMessage, setAdoptionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pet details
  const { data: pet, isLoading: isLoadingPet, error: petError } = useQuery<Pet>({
    queryKey: [petId ? `/api/pets/${petId}` : null],
    enabled: !!petId
  });

  // Fetch shelter details if pet has a shelter_id
  const { data: shelter } = useQuery<Shelter>({
    queryKey: [pet?.shelter_id ? `/api/shelters/${pet.shelter_id}` : null],
    enabled: !!pet?.shelter_id
  });

  if (!petId) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Header />
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Invalid Pet ID</h2>
            <p className="text-neutral-600 mb-6">
              The pet you are looking for could not be found. Please check the URL and try again.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const toggleFavorite = () => {
    setFavorite(!favorite);
    toast({
      title: favorite ? "Removed from favorites" : "Added to favorites",
      description: favorite ? "This pet has been removed from your favorites." : "This pet has been added to your favorites!",
      duration: 3000
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Adopt ${pet?.name}`,
        text: `Check out ${pet?.name}, a ${pet?.breed} looking for a forever home!`,
        url: window.location.href
      }).then(() => {
        console.log('Successfully shared');
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The link to this pet's profile has been copied to your clipboard.",
        duration: 3000
      });
    }
  };

  const handleAdoptRequest = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in or register to submit an adoption request.",
        variant: "destructive"
      });
      window.location.href = `/login?redirect=/pet/${petId}`;
      return;
    }
    
    setIsAdoptModalOpen(true);
  };

  const submitAdoptionRequest = async () => {
    if (!pet) return;
    
    try {
      setIsSubmitting(true);
      
      await apiRequest('POST', '/api/adoption-requests', {
        pet_id: pet.id,
        message: adoptionMessage || `I would like to adopt ${pet.name}`
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/pets/${pet.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/adoption-requests/user'] });
      
      toast({
        title: "Adoption request submitted",
        description: "Your request has been submitted successfully. The shelter will contact you soon.",
        duration: 5000
      });
      
      setIsAdoptModalOpen(false);
      setAdoptionMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your adoption request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-black";
      case "adopted":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 flex items-center text-neutral-600 hover:text-neutral-900"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="mr-1 h-5 w-5" /> Back to search
        </Button>
        
        {isLoadingPet ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="bg-neutral-200 animate-pulse h-96 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-neutral-200 animate-pulse h-24 rounded"></div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="h-8 bg-neutral-200 animate-pulse w-32 mb-2 rounded"></div>
              <div className="h-10 bg-neutral-200 animate-pulse w-3/4 mb-4 rounded"></div>
              <div className="h-6 bg-neutral-200 animate-pulse w-1/2 mb-6 rounded"></div>
              <div className="h-24 bg-neutral-200 animate-pulse w-full mb-6 rounded"></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 animate-pulse rounded"></div>
                ))}
              </div>
              <div className="h-32 bg-neutral-200 animate-pulse w-full mb-6 rounded"></div>
              <div className="flex gap-2">
                <div className="h-12 bg-neutral-200 animate-pulse w-1/2 rounded"></div>
                <div className="h-12 bg-neutral-200 animate-pulse w-1/2 rounded"></div>
              </div>
            </div>
          </div>
        ) : petError ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Pet Details</h3>
            <p className="text-neutral-600 mb-6">
              There was a problem loading this pet's information. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : pet ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left column - Images */}
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-4">
                <img 
                  src={pet.images && pet.images.length > 0 ? pet.images[activeImage] : "https://placehold.co/800x600?text=No+Image"} 
                  alt={`${pet.name}`} 
                  className="w-full h-auto object-cover" 
                />
              </div>
              
              {pet.images && pet.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {pet.images.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${pet.name} photo ${index + 1}`} 
                      className={`w-full h-24 object-cover rounded cursor-pointer border-2 ${activeImage === index ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setActiveImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Right column - Pet info */}
            <div className="md:w-1/2">
              <Badge className={`mb-2 ${getStatusBadgeColor(pet.status)}`}>
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Badge>
              
              <h1 className="text-3xl font-semibold mb-2">{pet.name}</h1>
              
              <div className="flex items-center text-neutral-600 mb-6">
                <span className="mr-3">{pet.breed || 'Unknown breed'}</span>
                <span className="mr-3">•</span>
                <span>{pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Unknown'}</span>
                <span className="mr-3">•</span>
                <span>{pet.age ? `${pet.age} years old` : 'Age unknown'}</span>
              </div>
              
              <Tabs defaultValue="about" className="mb-6">
                <TabsList>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="shelter">Shelter Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="pt-4">
                  <p className="text-neutral-700 mb-6">{pet.description || 'No description available for this pet.'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-neutral-500 mb-1">Size</p>
                        <p className="font-medium">{pet.size || 'Unknown'}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-neutral-500 mb-1">Color</p>
                        <p className="font-medium">{pet.color || 'Unknown'}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-neutral-500 mb-1">Weight</p>
                        <p className="font-medium">{pet.weight || 'Unknown'}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-neutral-500 mb-1">Good with</p>
                        <p className="font-medium">
                          {[
                            pet.good_with_children && 'Kids',
                            pet.good_with_dogs && 'Dogs',
                            pet.good_with_cats && 'Cats'
                          ].filter(Boolean).join(', ') || 'Information not available'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Personality</h3>
                      <p className="text-neutral-700">
                        {pet.name} is {pet.gender === 'male' ? 'a gentle boy' : pet.gender === 'female' ? 'a sweet girl' : 'a wonderful pet'} with a 
                        {pet.breed?.includes('Retriever') ? ' playful and friendly' : 
                          pet.breed?.includes('Shepherd') ? ' loyal and intelligent' : 
                          pet.breed?.includes('Terrier') ? ' spirited and energetic' : 
                          pet.type === 'cat' ? ' curious and independent' : ' loving'} 
                        personality. {pet.gender === 'male' ? 'He' : pet.gender === 'female' ? 'She' : 'They'} enjoys 
                        {pet.type === 'dog' ? ' walks, playtime, and cuddles' : 
                          pet.type === 'cat' ? ' climbing, napping in sunny spots, and interactive toys' : 
                          ' attention and companionship'}.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Health</h3>
                      <p className="text-neutral-700">
                        {pet.name} is in {pet.age && pet.age > 8 ? 'good health for ' + (pet.gender === 'male' ? 'his' : 'her') + ' age' : 'excellent health'} and is 
                        up-to-date on all vaccinations. {pet.gender === 'male' ? 'He is' : pet.gender === 'female' ? 'She is' : 'They are'} 
                        spayed/neutered and microchipped.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ideal Home</h3>
                      <p className="text-neutral-700">
                        {pet.name} would thrive in a home 
                        {!pet.good_with_children ? ' without young children' : ' with children of any age'}, 
                        {!pet.good_with_dogs ? ' as the only dog' : ' with other dogs'}, and 
                        {!pet.good_with_cats ? ' without cats' : ' with cat companions'}. 
                        {pet.gender === 'male' ? 'He needs' : pet.gender === 'female' ? 'She needs' : 'They need'} 
                        {pet.type === 'dog' && pet.size === 'large' ? ' a home with a yard or access to regular exercise' : 
                          pet.type === 'cat' ? ' a safe indoor environment with plenty of enrichment' : 
                          ' a loving and attentive family'}.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="shelter" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{shelter?.name || 'Happy Tails Rescue'}</CardTitle>
                      <CardDescription>
                        {shelter?.city || 'Pet City'}, {shelter?.state || 'PC'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-neutral-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">
                          {shelter?.address || '456 Shelter Rd'}, {shelter?.city || 'Pet City'}, {shelter?.state || 'PC'} {shelter?.zip || '12345'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-neutral-500 mr-2" />
                        <a href={`tel:${shelter?.phone || '(555) 987-6543'}`} className="text-primary">
                          {shelter?.phone || '(555) 987-6543'}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-neutral-500 mr-2" />
                        <a href={`mailto:${shelter?.email || 'info@happytailsrescue.org'}`} className="text-primary">
                          {shelter?.email || 'info@happytailsrescue.org'}
                        </a>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => window.location.href = `/shelters?id=${pet.shelter_id || 1}`}>
                        Visit Shelter Page
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  disabled={pet.status !== 'available'}
                  onClick={handleAdoptRequest}
                >
                  Adopt Me
                </Button>
                <Button 
                  className="flex-1" 
                  variant="secondary"
                  disabled={pet.status !== 'available'}
                >
                  Foster Me
                </Button>
                <Button variant="outline" onClick={toggleFavorite}>
                  <Heart className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-5 w-5" />
                </Button>
              </div>
              
              {pet.status === 'pending' && (
                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <p className="text-amber-800 text-sm">
                    This pet has a pending adoption request. They may no longer be available, but you can still express interest in case the current application isn't approved.
                  </p>
                </div>
              )}
              
              {pet.status === 'adopted' && (
                <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <p className="text-blue-800 text-sm">
                    Great news! This pet has found their forever home. Please browse our other available pets who are still looking for loving families.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
      
      <Footer />
      
      {/* Adoption Request Modal */}
      <Dialog open={isAdoptModalOpen} onOpenChange={setIsAdoptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adoption Request</DialogTitle>
            <DialogDescription>
              You're one step closer to bringing {pet?.name} home! Please provide some additional information for the shelter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Message for the Shelter (Optional)
              </label>
              <Textarea
                placeholder={`Tell us why you'd like to adopt ${pet?.name} and a bit about your home environment...`}
                value={adoptionMessage}
                onChange={(e) => setAdoptionMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-md text-sm space-y-2">
              <p className="font-medium">What happens next?</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>The shelter will review your application</li>
                <li>You'll be contacted to schedule a meet-and-greet</li>
                <li>If approved, you'll complete the adoption paperwork and pay adoption fees</li>
                <li>You'll welcome your new pet home!</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdoptModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitAdoptionRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
