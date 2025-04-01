import { LostFoundPet } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface LostFoundCardProps {
  pet: LostFoundPet;
  onContactClick: (pet: LostFoundPet) => void;
}

export default function LostFoundCard({ pet, onContactClick }: LostFoundCardProps) {
  // Format date to be more readable
  const formatDate = (date: Date) => {
    const now = new Date();
    const petDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - petDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const isLost = pet.type === 'lost';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border ${
      isLost ? 'border-rose-300' : 'border-emerald-300'
    }`}>
      <div className={`${isLost ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} px-3 py-1 text-center`}>
        <span className="text-sm font-medium">
          {isLost ? 'Lost Pet' : 'Found Pet'}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img 
            src={pet.images && Array.isArray(pet.images) && pet.images.length > 0 
              ? pet.images[0] 
              : "https://placehold.co/100x100?text=No+Image"} 
            alt={pet.name || `Unknown ${pet.pet_type}`} 
            className="w-16 h-16 rounded-full object-cover mr-3" 
          />
          <div>
            <h4 className="font-semibold">{pet.name || `Unknown ${pet.pet_type}`}</h4>
            <p className="text-sm text-neutral-600">
              {pet.breed || pet.pet_type.charAt(0).toUpperCase() + pet.pet_type.slice(1)}, 
              {pet.gender ? ` ${pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}` : ''}
            </p>
          </div>
        </div>
        <div className="text-sm text-neutral-600 mb-3">
          <p>
            <strong>{isLost ? 'Last seen:' : 'Found:'}</strong> {pet.location}, {formatDate(pet.date)}
          </p>
          <p>
            <strong>Details:</strong> {pet.description.length > 50 ? `${pet.description.substring(0, 50)}...` : pet.description}
          </p>
        </div>
        <Button 
          className={`w-full ${isLost ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          onClick={() => onContactClick(pet)}
        >
          {isLost ? "I've Seen This Pet" : "This Could Be My Pet"}
        </Button>
      </div>
    </div>
  );
}
