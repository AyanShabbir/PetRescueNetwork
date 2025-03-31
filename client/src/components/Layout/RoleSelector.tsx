import { useRole } from "@/context/RoleContext";
import { User, PawPrint, Stethoscope, Building2, ShieldAlert } from "lucide-react";

export default function RoleSelector() {
  const { role, setRole } = useRole();

  return (
    <div className="bg-neutral-200 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 md:space-x-4 overflow-x-auto role-selector text-sm md:text-base">
          <button 
            className={`role-button px-3 py-1 md:px-4 md:py-2 rounded-t-md font-medium flex items-center ${
              role === 'adopter' 
                ? 'bg-white text-primary border-b-2 border-primary' 
                : 'bg-neutral-100 hover:bg-white text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setRole('adopter')}
          >
            <User className="inline-block mr-1 h-4 w-4 md:h-5 md:w-5" /> Adopter
          </button>
          <button 
            className={`role-button px-3 py-1 md:px-4 md:py-2 rounded-t-md font-medium flex items-center ${
              role === 'rescuer' 
                ? 'bg-white text-primary border-b-2 border-primary' 
                : 'bg-neutral-100 hover:bg-white text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setRole('rescuer')}
          >
            <PawPrint className="inline-block mr-1 h-4 w-4 md:h-5 md:w-5" /> Rescuer
          </button>
          <button 
            className={`role-button px-3 py-1 md:px-4 md:py-2 rounded-t-md font-medium flex items-center ${
              role === 'veterinarian' 
                ? 'bg-white text-primary border-b-2 border-primary' 
                : 'bg-neutral-100 hover:bg-white text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setRole('veterinarian')}
          >
            <Stethoscope className="inline-block mr-1 h-4 w-4 md:h-5 md:w-5" /> Veterinarian
          </button>
          <button 
            className={`role-button px-3 py-1 md:px-4 md:py-2 rounded-t-md font-medium flex items-center ${
              role === 'shelter_staff' 
                ? 'bg-white text-primary border-b-2 border-primary' 
                : 'bg-neutral-100 hover:bg-white text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setRole('shelter_staff')}
          >
            <Building2 className="inline-block mr-1 h-4 w-4 md:h-5 md:w-5" /> Shelter Staff
          </button>
          <button 
            className={`role-button px-3 py-1 md:px-4 md:py-2 rounded-t-md font-medium flex items-center ${
              role === 'admin' 
                ? 'bg-white text-primary border-b-2 border-primary' 
                : 'bg-neutral-100 hover:bg-white text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setRole('admin')}
          >
            <ShieldAlert className="inline-block mr-1 h-4 w-4 md:h-5 md:w-5" /> Admin
          </button>
        </div>
      </div>
    </div>
  );
}
