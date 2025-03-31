import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FindPets from "@/pages/FindPets";
import LostFound from "@/pages/LostFound";
import Shelters from "@/pages/Shelters";
import Donate from "@/pages/Donate";
import PetDetails from "@/pages/PetDetails";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "@/context/AuthContext";
import { RoleProvider } from "@/context/RoleContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-pets" component={FindPets} />
      <Route path="/lost-found" component={LostFound} />
      <Route path="/shelters" component={Shelters} />
      <Route path="/donate" component={Donate} />
      <Route path="/pet/:id" component={PetDetails} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <Router />
          <Toaster />
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
