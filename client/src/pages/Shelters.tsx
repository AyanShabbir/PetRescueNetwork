import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import { Shelter, Pet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ChevronRight, 
  Building2, 
  Search,
  PlusCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PetCard from "@/components/PetCards/PetCard";
import PetDetailsModal from "@/components/Modals/PetDetailsModal";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Shelters() {
  const { role } = useRole();
  const { user } = useAuth();
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [isShelterModalOpen, setIsShelterModalOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all shelters
  const { data: shelters, isLoading: isLoadingShelters } = useQuery<Shelter[]>({
    queryKey: ['/api/shelters'],
  });

  // Fetch pets for selected shelter
  const { data: shelterPets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ['/api/pets', selectedShelter?.id],
    queryFn: async () => {
      if (!selectedShelter) return [];
      const url = `/api/pets?shelter_id=${selectedShelter.id}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch shelter pets');
      return response.json();
    },
    enabled: !!selectedShelter,
  });

  const openShelterDetails = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    setIsShelterModalOpen(true);
  };

  const openPetDetails = (petId: number) => {
    setSelectedPetId(petId);
  };

  const closePetDetails = () => {
    setSelectedPetId(null);
  };

  // Filter shelters based on search query
  const filteredShelters = shelters?.filter(shelter => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      shelter.name.toLowerCase().includes(query) ||
      shelter.city.toLowerCase().includes(query) ||
      shelter.state.toLowerCase().includes(query) ||
      shelter.zip.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-semibold mb-2">Animal Shelters & Rescue Groups</h2>
          <p className="text-neutral-600 mb-4">
            Find animal shelters and rescue groups in your area. Learn about their available pets,
            adoption processes, and how you can help by volunteering or donating.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
              <Input
                placeholder="Search shelters by name or location"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {(role === 'admin') && (
              <Button className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Shelter
              </Button>
            )}
          </div>
        </div>
        
        {/* Shelters List */}
        {isLoadingShelters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-52 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-neutral-200 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredShelters && filteredShelters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShelters.map((shelter) => (
              <Card key={shelter.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{shelter.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-neutral-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">
                          {shelter.address}, {shelter.city}, {shelter.state} {shelter.zip}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-neutral-500 mr-2" />
                        <a href={`tel:${shelter.phone}`} className="text-primary">
                          {shelter.phone}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-neutral-500 mr-2" />
                        <a href={`mailto:${shelter.email}`} className="text-primary">
                          {shelter.email}
                        </a>
                      </div>
                      {shelter.website && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-neutral-500 mr-2" />
                          <a 
                            href={shelter.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary truncate"
                          >
                            {shelter.website.replace(/(^\w+:|^)\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full flex items-center justify-between"
                      onClick={() => openShelterDetails(shelter)}
                    >
                      View Details <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Building2 className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
            <h3 className="text-xl font-semibold mb-2">No Shelters Found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery 
                ? "We couldn't find any shelters matching your search criteria." 
                : "There are no shelters available at the moment."
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            )}
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Shelter Details Modal */}
      <Dialog open={isShelterModalOpen} onOpenChange={setIsShelterModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedShelter?.name}</DialogTitle>
            <DialogDescription>
              {selectedShelter?.city}, {selectedShelter?.state}
            </DialogDescription>
          </DialogHeader>
          
          {selectedShelter && (
            <div>
              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="pets">Available Pets</TabsTrigger>
                  <TabsTrigger value="donate">Donate</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">About Us</h4>
                      <p className="text-neutral-700">
                        {selectedShelter.description || 
                          "This shelter provides care and shelter for homeless animals while finding them loving forever homes."}
                      </p>
                    </div>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-neutral-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-700">
                            {selectedShelter.address}, {selectedShelter.city}, {selectedShelter.state} {selectedShelter.zip}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-neutral-500 mr-2" />
                          <a href={`tel:${selectedShelter.phone}`} className="text-primary">
                            {selectedShelter.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-neutral-500 mr-2" />
                          <a href={`mailto:${selectedShelter.email}`} className="text-primary">
                            {selectedShelter.email}
                          </a>
                        </div>
                        {selectedShelter.website && (
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-neutral-500 mr-2" />
                            <a 
                              href={selectedShelter.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary break-all"
                            >
                              {selectedShelter.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Hours of Operation</h4>
                      <p className="text-neutral-700">
                        Monday - Friday: 10:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 5:00 PM<br />
                        Sunday: 12:00 PM - 4:00 PM
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Adoption Process</h4>
                      <p className="text-neutral-700 mb-2">
                        Our adoption process includes the following steps:
                      </p>
                      <ol className="list-decimal pl-5 space-y-1 text-neutral-700">
                        <li>Browse our available pets online or visit in person</li>
                        <li>Complete an adoption application</li>
                        <li>Meet the pet you're interested in adopting</li>
                        <li>Reference check and possible home visit</li>
                        <li>Adoption approval and signing of contract</li>
                        <li>Take your new pet home!</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pets">
                  {isLoadingPets ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-neutral-100 rounded-lg p-4 animate-pulse h-60">
                          <div className="h-28 bg-neutral-200 rounded mb-3"></div>
                          <div className="h-5 bg-neutral-200 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
                          <div className="h-10 bg-neutral-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : shelterPets && shelterPets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shelterPets.map((pet) => (
                        <div key={pet.id} onClick={() => openPetDetails(pet.id)}>
                          <PetCard pet={pet} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-neutral-50 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2">No Available Pets</h4>
                      <p className="text-neutral-600 mb-4">
                        This shelter currently has no pets available for adoption.
                      </p>
                      <p className="text-neutral-600">
                        Please check back later or contact the shelter directly for more information.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="donate">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Support Our Work</h4>
                      <p className="text-neutral-700 mb-4">
                        Your donations help us provide food, shelter, medical care, and love to animals in need.
                        Every contribution makes a difference in the lives of our rescue animals.
                      </p>
                      
                      <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                        <h5 className="font-medium mb-2">Ways to Donate</h5>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                          <li>Make a one-time or recurring monetary donation</li>
                          <li>Donate supplies from our wishlist</li>
                          <li>Sponsor a specific animal's care</li>
                          <li>Include us in your estate planning</li>
                          <li>Fundraise on our behalf</li>
                        </ul>
                      </div>
                      
                      <Button 
                        className="bg-[#F5A623] hover:bg-[#F5A623]/90 w-full sm:w-auto"
                        onClick={() => window.location.href = "/donate?shelter=" + selectedShelter.id}
                      >
                        Make a Donation
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Volunteer Opportunities</h4>
                      <p className="text-neutral-700 mb-2">
                        We're always looking for dedicated volunteers to help with:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-700 mb-4">
                        <li>Animal care and socialization</li>
                        <li>Foster care</li>
                        <li>Adoption events</li>
                        <li>Administrative support</li>
                        <li>Facility maintenance</li>
                        <li>Transportation</li>
                      </ul>
                      
                      <Button variant="outline">Learn About Volunteering</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Pet Details Modal */}
      <PetDetailsModal 
        petId={selectedPetId} 
        isOpen={selectedPetId !== null} 
        onClose={closePetDetails} 
      />
    </div>
  );
}
