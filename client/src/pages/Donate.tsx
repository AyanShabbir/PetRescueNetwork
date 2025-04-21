import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function Donate() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Support Our Mission</h1>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error 404</AlertTitle>
          <AlertDescription>
            Our donation system is currently offline. Please check back later.
          </AlertDescription>
        </Alert>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Donation System Unavailable</h2>
            <p className="text-neutral-600">
              We apologize for the inconvenience. Our donation system is currently unavailable.
              We're working hard to restore functionality as soon as possible.
            </p>
            <p className="text-neutral-600">
              Please try again later or contact us directly for alternative donation methods.
            </p>
            
            <div className="mt-6">
              <Link href="/">
                <Button>
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}