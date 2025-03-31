import { createContext, useContext, useState, ReactNode } from "react";

type Role = 'adopter' | 'rescuer' | 'veterinarian' | 'shelter_staff' | 'admin';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Default role is 'adopter'
  const [role, setRole] = useState<Role>('adopter');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
