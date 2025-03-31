import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchX, Flag, Filter, AlertTriangle, CheckCircle } from "lucide-react";
import { LostFoundPet } from "@shared/schema";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import RoleSelector from "@/components/Layout/RoleSelector";
import LostFoundCard from "@/components/PetCards/LostFoundCard";
import ReportModal from "@/components/Modals/ReportModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function LostFound() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [selectedPet, setSelectedPet] = useState<LostFoundPet | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [petTypeFilter, setPetTypeFilter] = useState("");

  // Fetch lost and found pets
  const { data: lostFoundPets, isLoading } = useQuery<LostFoundPet[]>({
    queryKey: ['/api/lost-found-pets'],
  });

  const handleReportPet = (type: 'lost' | 'found') => {
    setReportType(type);
    setIsReportModalOpen(true);
  };

  const handleLostFoundContact = (pet: LostFoundPet) => {
    setSelectedPet(pet);
    setIsContactModalOpen(true);
  };

  const resetFilters = () => {
    setLocationFilter("");
    setPetTypeFilter("");
  };

  // Filter pets based on tab and filters
  const filteredPets = lostFoundPets?.filter(pet => {
    // First, filter by tab
    if (activeTab !== "all" && pet.type !== activeTab) {
      return false;
    }

    // Then apply additional filters
    if (locationFilter && !pet.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    if (petTypeFilter && pet.pet_type !== petTypeFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <RoleSelector />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card className="mb-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Report a Pet</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center"
                    onClick={() => handleReportPet('lost')}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Lost Pet
                  </Button>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center"
                    onClick={() => handleReportPet('found')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Report Found Pet
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Filters - Desktop Only */}
            <Card className="hidden md:block">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Location
                    </label>
                    <Input
                      placeholder="City or area"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Pet Type
                    </label>
                    <Select value={petTypeFilter} onValueChange={setPetTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="dog">Dogs</SelectItem>
                        <SelectItem value="cat">Cats</SelectItem>
                        <SelectItem value="rabbit">Rabbits</SelectItem>
                        <SelectItem value="bird">Birds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Lost & Found Pets</h2>
              <Button 
                className="md:hidden flex items-center"
                onClick={() => setFilterOpen(!filterOpen)}
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
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Location
                      </label>
                      <Input
                        placeholder="City or area"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Pet Type
                      </label>
                      <Select value={petTypeFilter} onValueChange={setPetTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="dog">Dogs</SelectItem>
                          <SelectItem value="cat">Cats</SelectItem>
                          <SelectItem value="rabbit">Rabbits</SelectItem>
                          <SelectItem value="bird">Birds</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-grow" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                      <Button variant="outline" onClick={() => setFilterOpen(false)}>Close</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="lost">Lost Pets</TabsTrigger>
                <TabsTrigger value="found">Found Pets</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
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
            ) : filteredPets && filteredPets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPets.map((pet) => (
                  <LostFoundCard 
                    key={pet.id} 
                    pet={pet} 
                    onContactClick={handleLostFoundContact}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <SearchX className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                <h3 className="text-xl font-semibold mb-2">No Matching Pets Found</h3>
                <p className="text-neutral-600 mb-6">
                  We couldn't find any {activeTab !== "all" ? activeTab : "lost or found"} pets matching your criteria.
                </p>
                {activeTab !== "all" ? (
                  <Button onClick={() => setActiveTab("all")}>View All Pets</Button>
                ) : (
                  <Button onClick={resetFilters}>Reset Filters</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Report Pet Modal */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialType={reportType}
      />
      
      {/* Contact Modal for Lost/Found Pet */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              Contact details for the {selectedPet?.type} pet {selectedPet?.name && `(${selectedPet.name})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPet && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={selectedPet.images && selectedPet.images.length > 0 
                      ? selectedPet.images[0] 
                      : "https://placehold.co/100x100?text=No+Image"} 
                    alt={selectedPet.name || `Unknown ${selectedPet.pet_type}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {selectedPet.name || `Unknown ${selectedPet.pet_type}`}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    {selectedPet.type === 'lost' ? 'Lost on ' : 'Found on '}
                    {new Date(selectedPet.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 bg-neutral-50 p-4 rounded-md">
                <p className="font-medium">Reported by:</p>
                <p>{selectedPet.contact_name}</p>
                <p className="flex items-center">
                  <span className="mr-2">Phone:</span>
                  <a href={`tel:${selectedPet.contact_phone}`} className="text-primary">
                    {selectedPet.contact_phone}
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="mr-2">Email:</span>
                  <a href={`mailto:${selectedPet.contact_email}`} className="text-primary">
                    {selectedPet.contact_email}
                  </a>
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Description:</p>
                <p className="text-neutral-700">{selectedPet.description}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Location:</p>
                <p className="text-neutral-700">{selectedPet.location}</p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => setIsContactModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
