import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function QuickSearch() {
  const [, navigate] = useLocation();
  const [animalType, setAnimalType] = useState("all");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("25");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string from form values
    const params = new URLSearchParams();
    if (animalType && animalType !== "all") params.append("type", animalType);
    if (location) params.append("location", location);
    if (distance) params.append("distance", distance);
    
    // Navigate to search results page
    navigate(`/find-pets?${params.toString()}`);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Search</h3>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="mb-0">
              <label htmlFor="animal-type" className="block text-sm font-medium text-neutral-700 mb-1">
                Animal Type
              </label>
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
            <div className="mb-0">
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                Location
              </label>
              <Input
                type="text"
                id="location"
                placeholder="City, State or ZIP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="mb-0">
              <label htmlFor="distance" className="block text-sm font-medium text-neutral-700 mb-1">
                Distance
              </label>
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
            <div className="mb-0 flex items-end">
              <Button type="submit" className="w-full flex items-center justify-center">
                <Search className="mr-1 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
