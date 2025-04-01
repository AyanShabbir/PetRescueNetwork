import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Flag, Heart } from "lucide-react";
import { Pet, LostFoundPet } from "@shared/schema";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import QuickSearch from "@/components/Search/QuickSearch";
import PetCard from "@/components/PetCards/PetCard";
import LostFoundCard from "@/components/PetCards/LostFoundCard";
import PetDetailsModal from "@/components/Modals/PetDetailsModal";
import ReportModal from "@/components/Modals/ReportModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');

  // Fetch featured pets (available pets)
  const { data: featuredPets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ['/api/pets?status=available'],
  });

  // Fetch lost and found pets
  const { data: lostFoundPets, isLoading: isLoadingLostFoundPets } = useQuery<LostFoundPet[]>({
    queryKey: ['/api/lost-found-pets'],
  });

  const openPetDetails = (petId: number) => {
    setSelectedPetId(petId);
  };

  const closePetDetails = () => {
    setSelectedPetId(null);
  };

  const openReportModal = (type: 'lost' | 'found') => {
    setReportType(type);
    setIsReportModalOpen(true);
  };

  const handleLostFoundContact = (pet: LostFoundPet) => {
    toast({
      title: `Contact for ${pet.type === 'lost' ? 'lost' : 'found'} pet`,
      description: `Please contact ${pet.contact_name} at ${pet.contact_phone} or ${pet.contact_email}.`,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="p-6 md:p-8 md:w-1/2">
              <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3">Find Your Perfect Companion</h2>
              <p className="text-white/90 mb-6">Thousands of loving pets are waiting for their forever homes. Search our database to find the perfect match for your family.</p>
              <div className="flex space-x-3">
                <Link href="/find-pets">
                  <Button variant="secondary" className="bg-white text-primary hover:bg-neutral-100 flex items-center">
                    <Search className="mr-1 h-4 w-4" /> Find a Pet
                  </Button>
                </Link>
                <Button 
                  className="bg-[#50C878] hover:bg-[#50C878]/90 flex items-center"
                  onClick={() => openReportModal('lost')}
                >
                  <Flag className="mr-1 h-4 w-4" /> Report Lost/Found
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 h-48 md:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Happy dog and cat" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </section>

        {/* Quick Search Section */}
        <QuickSearch />

        {/* Featured Pets Section */}
        <section className="mb-8 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Featured Pets</h3>
            <Link href="/find-pets" className="text-primary hover:underline flex items-center">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          
          {isLoadingPets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredPets?.slice(0, 4).map((pet) => (
                <div key={pet.id} onClick={() => openPetDetails(pet.id)}>
                  <PetCard pet={pet} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services Section */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Our Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:border-primary/30 hover:bg-neutral-50 transition-colors">
              <Search className="text-primary h-12 w-12 mb-3" />
              <h4 className="font-semibold text-lg mb-2">Find a Pet</h4>
              <p className="text-sm text-neutral-600 mb-3">Browse our database of available pets from shelters and rescue groups in your area.</p>
              <Link href="/find-pets" className="text-primary hover:underline mt-auto">Learn more</Link>
            </div>
            <div className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:border-primary/30 hover:bg-neutral-50 transition-colors">
              <Flag className="text-primary h-12 w-12 mb-3" />
              <h4 className="font-semibold text-lg mb-2">Lost & Found</h4>
              <p className="text-sm text-neutral-600 mb-3">Report a lost pet or browse found pets in your area to reunite them with their families.</p>
              <Link href="/lost-found" className="text-primary hover:underline mt-auto">Learn more</Link>
            </div>
            <div className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:border-primary/30 hover:bg-neutral-50 transition-colors">
              <Heart className="text-primary h-12 w-12 mb-3" />
              <h4 className="font-semibold text-lg mb-2">Volunteer</h4>
              <p className="text-sm text-neutral-600 mb-3">Support local shelters and rescue groups with your time and skills.</p>
              <Link href="/shelters" className="text-primary hover:underline mt-auto">Find shelters</Link>
            </div>
          </div>
        </section>

        {/* Lost & Found Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recently Lost & Found</h3>
            <Link href="/lost-found" className="text-primary hover:underline flex items-center">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          
          {isLoadingLostFoundPets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-300">
                  <div className="bg-neutral-200 animate-pulse h-8"></div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-neutral-200 animate-pulse mr-3"></div>
                      <div>
                        <div className="h-5 bg-neutral-200 rounded animate-pulse w-24 mb-1"></div>
                        <div className="h-4 bg-neutral-200 rounded animate-pulse w-32"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-3"></div>
                    <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {lostFoundPets?.slice(0, 4).map((pet) => (
                <LostFoundCard 
                  key={pet.id} 
                  pet={pet} 
                  onContactClick={handleLostFoundContact} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Call to Action Section */}
        <section className="bg-[#F5A623]/10 rounded-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-2/3 mb-4 md:mb-0">
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Want to help pets in your community?</h3>
              <p className="text-neutral-700">Become a volunteer or foster parent to support shelter pets.</p>
            </div>
            <div className="md:w-1/3 flex flex-wrap gap-2 md:justify-end">
              <Link href="/shelters">
                <Button className="bg-[#F5A623] hover:bg-[#F5A623]/90">Find Shelters</Button>
              </Link>
              <Link href="/lost-found">
                <Button variant="outline" className="text-[#F5A623] border-[#F5A623]">Report Lost Pet</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <PetDetailsModal 
        petId={selectedPetId} 
        isOpen={selectedPetId !== null} 
        onClose={closePetDetails} 
      />
      
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        initialType={reportType}
      />
    </div>
  );
}
