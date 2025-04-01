import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Pet } from "@shared/schema";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import PetCard from "@/components/PetCards/PetCard";
import PetDetailsModal from "@/components/Modals/PetDetailsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function FindPets() {
  const [location] = useLocation();
  // Parse query parameters from the URL
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  // Filter states
  const [animalType, setAnimalType] = useState(params.get('type') || '');
  const [petLocation, setPetLocation] = useState(params.get('location') || '');
  const [distance, setDistance] = useState(params.get('distance') || '25');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Additional filters
  const [filterAge, setFilterAge] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterSize, setFilterSize] = useState<string>('');
  const [goodWithKids, setGoodWithKids] = useState<boolean>(false);
  const [goodWithDogs, setGoodWithDogs] = useState<boolean>(false);
  const [goodWithCats, setGoodWithCats] = useState<boolean>(false);

  // Fetch pets with the basic filters
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ['/api/pets', animalType],
    queryFn: async () => {
      const url = animalType 
        ? `/api/pets?type=${animalType}&status=available` 
        : '/api/pets?status=available';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch pets');
      return response.json();
    }
  });

  // Apply additional filters to the results from the API
  const filteredPets = pets?.filter(pet => {
    // If no additional filters are applied, return all pets
    if (!filterAge && !filterGender && !filterSize && !goodWithKids && !goodWithDogs && !goodWithCats) {
      return true;
    }

    // Apply age filter
    if (filterAge && pet.age) {
      if (filterAge === 'puppy' && pet.age > 1) return false;
      if (filterAge === 'young' && (pet.age <= 1 || pet.age > 5)) return false;
      if (filterAge === 'adult' && (pet.age <= 5 || pet.age > 10)) return false;
      if (filterAge === 'senior' && pet.age <= 10) return false;
    }

    // Apply gender filter
    if (filterGender && pet.gender !== filterGender) return false;

    // Apply size filter
    if (filterSize && pet.size !== filterSize) return false;

    // Apply compatibility filters
    if (goodWithKids && !pet.good_with_children) return false;
    if (goodWithDogs && !pet.good_with_dogs) return false;
    if (goodWithCats && !pet.good_with_cats) return false;

    return true;
  });

  const openPetDetails = (petId: number) => {
    setSelectedPetId(petId);
  };

  const closePetDetails = () => {
    setSelectedPetId(null);
  };

  // Toggle the filter sidebar on mobile
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Reset all filters
  const resetFilters = () => {
    setAnimalType('');
    setPetLocation('');
    setDistance('25');
    setFilterAge('');
    setFilterGender('');
    setFilterSize('');
    setGoodWithKids(false);
    setGoodWithDogs(false);
    setGoodWithCats(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="animal-type">Animal Type</Label>
                    <Select value={animalType} onValueChange={setAnimalType}>
                      <SelectTrigger id="animal-type">
                        <SelectValue placeholder="All Animals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Animals</SelectItem>
                        <SelectItem value="dog">Dogs</SelectItem>
                        <SelectItem value="cat">Cats</SelectItem>
                        <SelectItem value="rabbit">Rabbits</SelectItem>
                        <SelectItem value="bird">Birds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State or ZIP"
                      value={petLocation}
                      onChange={(e) => setPetLocation(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="distance">Distance</Label>
                    <Select value={distance} onValueChange={setDistance}>
                      <SelectTrigger id="distance">
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                        <SelectItem value="any">Any distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Select value={filterAge} onValueChange={setFilterAge}>
                      <SelectTrigger id="age">
                        <SelectValue placeholder="Any Age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Age</SelectItem>
                        <SelectItem value="puppy">Puppy/Kitten (&lt; 1 year)</SelectItem>
                        <SelectItem value="young">Young (1-5 years)</SelectItem>
                        <SelectItem value="adult">Adult (5-10 years)</SelectItem>
                        <SelectItem value="senior">Senior (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={filterGender} onValueChange={setFilterGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Any Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select value={filterSize} onValueChange={setFilterSize}>
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Any Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Size</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <span className="text-sm font-medium mb-2 block">Good with</span>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="kids" checked={goodWithKids} onCheckedChange={(checked) => setGoodWithKids(!!checked)} />
                        <label htmlFor="kids" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Kids
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dogs" checked={goodWithDogs} onCheckedChange={(checked) => setGoodWithDogs(!!checked)} />
                        <label htmlFor="dogs" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Dogs
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cats" checked={goodWithCats} onCheckedChange={(checked) => setGoodWithCats(!!checked)} />
                        <label htmlFor="cats" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Cats
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-2">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Find Your Perfect Pet</h2>
              <Button 
                className="md:hidden flex items-center"
                onClick={toggleFilter}
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>
            
            {/* Mobile Filters */}
            {filterOpen && (
              <Card className="mb-4 md:hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="m-animal-type">Animal Type</Label>
                        <Select value={animalType} onValueChange={setAnimalType}>
                          <SelectTrigger id="m-animal-type">
                            <SelectValue placeholder="All Animals" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Animals</SelectItem>
                            <SelectItem value="dog">Dogs</SelectItem>
                            <SelectItem value="cat">Cats</SelectItem>
                            <SelectItem value="rabbit">Rabbits</SelectItem>
                            <SelectItem value="bird">Birds</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="m-gender">Gender</Label>
                        <Select value={filterGender} onValueChange={setFilterGender}>
                          <SelectTrigger id="m-gender">
                            <SelectValue placeholder="Any Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Gender</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="m-age">Age</Label>
                        <Select value={filterAge} onValueChange={setFilterAge}>
                          <SelectTrigger id="m-age">
                            <SelectValue placeholder="Any Age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Age</SelectItem>
                            <SelectItem value="puppy">Puppy/Kitten (&lt; 1 year)</SelectItem>
                            <SelectItem value="young">Young (1-5 years)</SelectItem>
                            <SelectItem value="adult">Adult (5-10 years)</SelectItem>
                            <SelectItem value="senior">Senior (10+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="m-size">Size</Label>
                        <Select value={filterSize} onValueChange={setFilterSize}>
                          <SelectTrigger id="m-size">
                            <SelectValue placeholder="Any Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Size</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="m-kids" checked={goodWithKids} onCheckedChange={(checked) => setGoodWithKids(!!checked)} />
                        <label htmlFor="m-kids" className="text-sm">Good with Kids</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="m-dogs" checked={goodWithDogs} onCheckedChange={(checked) => setGoodWithDogs(!!checked)} />
                        <label htmlFor="m-dogs" className="text-sm">Good with Dogs</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="m-cats" checked={goodWithCats} onCheckedChange={(checked) => setGoodWithCats(!!checked)} />
                        <label htmlFor="m-cats" className="text-sm">Good with Cats</label>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-grow" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                      <Button variant="outline" onClick={() => setFilterOpen(false)}>Close</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Search Results */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-48 bg-neutral-200 animate-pulse"></div>
                      <div className="p-4">
                        <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-neutral-200 rounded animate-pulse mb-3 w-2/3"></div>
                        <div className="h-12 bg-neutral-200 rounded animate-pulse mb-3"></div>
                        <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPets && filteredPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPets.map((pet) => (
                    <div key={pet.id} onClick={() => openPetDetails(pet.id)}>
                      <PetCard pet={pet} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Search className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">No Pets Found</h3>
                  <p className="text-neutral-600 mb-6">
                    We couldn't find any pets matching your search criteria.
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Pet Details Modal */}
      <PetDetailsModal 
        petId={selectedPetId} 
        isOpen={selectedPetId !== null} 
        onClose={closePetDetails} 
      />
    </div>
  );
}
