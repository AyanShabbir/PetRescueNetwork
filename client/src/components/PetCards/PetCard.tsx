import { useState } from "react";
import { Link } from "wouter";
import { HeartIcon } from "lucide-react";
import { Pet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const [favorite, setFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img 
          src={pet.images && pet.images.length > 0 ? pet.images[0] : "https://placehold.co/400x300?text=No+Image"} 
          alt={`${pet.name} - ${pet.breed}`} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 right-2">
          <Badge className={`${getStatusBadgeColor(pet.status)}`}>
            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </Badge>
        </div>
        <button 
          className="absolute top-2 left-2 bg-white/80 p-1 rounded-full hover:bg-white" 
          title="Add to favorites"
          onClick={toggleFavorite}
        >
          <HeartIcon 
            className={`h-5 w-5 ${favorite ? 'text-red-500 fill-red-500' : 'text-neutral-500'}`} 
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg">{pet.name}</h4>
          <span className="text-sm text-neutral-500">2.3 miles</span>
        </div>
        <div className="flex items-center mb-3">
          <span className="text-sm text-neutral-600 mr-3">{pet.breed || 'Unknown breed'}</span>
          <span className="text-sm text-neutral-600">
            {pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Unknown'}, 
            {pet.age ? ` ${pet.age} yrs` : ' Age unknown'}
          </span>
        </div>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{pet.description || 'No description available.'}</p>
        <Link href={`/pet/${pet.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </div>
    </div>
  );
}
