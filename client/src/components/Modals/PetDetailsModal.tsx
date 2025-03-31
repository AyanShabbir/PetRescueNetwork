import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pet } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

interface PetDetailsModalProps {
  petId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetDetailsModal({ petId, isOpen, onClose }: PetDetailsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [favorite, setFavorite] = useState(false);

  const { data: pet, isLoading } = useQuery<Pet>({
    queryKey: [petId ? `/api/pets/${petId}` : null],
    enabled: !!petId && isOpen
  });

  if (!petId || !isOpen) {
    return null;
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
        description: "Please log in to submit an adoption request.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/adoption-requests', {
        pet_id: petId,
        message: `I would like to adopt ${pet?.name}`
      });
      
      toast({
        title: "Adoption request submitted",
        description: "Your request has been submitted successfully. The shelter will contact you soon.",
        duration: 5000
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your adoption request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFosterRequest = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to submit a foster request.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Foster request submitted",
      description: "Your request has been submitted successfully. The shelter will contact you soon.",
      duration: 5000
    });
    
    onClose();
  };

  if (isLoading || !pet) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{pet.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <div className="bg-neutral-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={pet.images && pet.images.length > 0 ? pet.images[activeImage] : "https://placehold.co/600x400?text=No+Image"} 
                alt={`${pet.name} - ${pet.breed}`} 
                className="w-full h-auto" 
              />
            </div>
            
            {pet.images && pet.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {pet.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${pet.name} photo ${index + 1}`} 
                    className={`w-full h-20 object-cover rounded cursor-pointer ${activeImage === index ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setActiveImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="md:w-1/2">
            <div className="mb-6">
              <Badge className={`mb-2 ${getStatusBadgeColor(pet.status)}`}>
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Badge>
              <h4 className="text-2xl font-semibold mb-1">{pet.name}</h4>
              <div className="flex items-center mb-2">
                <span className="text-neutral-600 mr-3">{pet.breed || 'Unknown breed'}</span>
                <span className="text-neutral-600">
                  {pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Unknown'}, 
                  {pet.age ? ` ${pet.age} yrs` : ' Age unknown'}
                </span>
              </div>
              <p className="mb-4">{pet.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-neutral-100 p-3 rounded">
                  <span className="text-sm text-neutral-500">Size</span>
                  <p className="font-medium">{pet.size || 'Unknown'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded">
                  <span className="text-sm text-neutral-500">Color</span>
                  <p className="font-medium">{pet.color || 'Unknown'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded">
                  <span className="text-sm text-neutral-500">Weight</span>
                  <p className="font-medium">{pet.weight || 'Unknown'}</p>
                </div>
                <div className="bg-neutral-100 p-3 rounded">
                  <span className="text-sm text-neutral-500">Good with</span>
                  <p className="font-medium">
                    {[
                      pet.good_with_children && 'Kids',
                      pet.good_with_dogs && 'Dogs',
                      pet.good_with_cats && 'Cats'
                    ].filter(Boolean).join(', ') || 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-semibold mb-2">Shelter Information</h5>
                <p className="text-sm mb-1"><strong>Location:</strong> Happy Tails Rescue</p>
                <p className="text-sm mb-1"><strong>Address:</strong> 456 Shelter Rd, Pet City</p>
                <p className="text-sm"><strong>Phone:</strong> (555) 987-6543</p>
              </div>
              
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
                  onClick={handleFosterRequest}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
