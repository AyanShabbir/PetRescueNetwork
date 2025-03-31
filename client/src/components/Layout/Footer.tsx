import { Link } from "wouter";
import { PawPrint, Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-lg mb-4">Pet Rescue Hub</h4>
            <p className="text-neutral-300 text-sm mb-4">Connecting pets with loving homes since 2023. Our mission is to make pet adoption simple, humane, and accessible to all.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-neutral-300 hover:text-white">About Us</Link></li>
              <li><Link href="/find-pets" className="text-neutral-300 hover:text-white">Find a Pet</Link></li>
              <li><Link href="/lost-found" className="text-neutral-300 hover:text-white">Lost & Found</Link></li>
              <li><Link href="/shelters" className="text-neutral-300 hover:text-white">Shelters</Link></li>
              <li><Link href="/donate" className="text-neutral-300 hover:text-white">Donate</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-300 hover:text-white">Pet Care Guides</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">Adoption Process</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">Foster Program</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">Volunteer Opportunities</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Contact Us</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <MapPin className="text-neutral-400 mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-300">123 Rescue Lane, Pet City, PC 12345</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-neutral-400 mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-300">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail className="text-neutral-400 mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-neutral-300">info@petrescuehub.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">&copy; 2023 Pet Rescue Hub. All rights reserved.</p>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="text-neutral-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-neutral-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-neutral-400 hover:text-white">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
