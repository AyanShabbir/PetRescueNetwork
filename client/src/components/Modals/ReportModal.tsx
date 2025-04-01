import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Upload, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'lost' | 'found';
}

const reportFormSchema = z.object({
  type: z.enum(['lost', 'found']),
  pet_type: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  name: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional().nullable(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  location: z.string().min(1, "Location is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  contact_name: z.string().min(1, "Your name is required"),
  contact_email: z.string().email("Valid email is required"),
  contact_phone: z.string().min(10, "Valid phone number is required"),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportModal({ isOpen, onClose, initialType = 'lost' }: ReportModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: initialType,
      pet_type: '',
      breed: '',
      name: '',
      gender: 'unknown',
      description: '',
      location: '',
      date: new Date(),
      contact_name: '',
      contact_email: '',
      contact_phone: '',
    }
  });

  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: ReportFormValues) => {
    setIsSubmitting(true);
    try {
      // Add images array to the data
      const submitData = {
        ...data,
        images: images
      };
      
      console.log("Submitting data:", submitData);
      
      await apiRequest('POST', '/api/lost-found-pets', submitData);
      
      toast({
        title: "Report submitted successfully",
        description: `Your ${data.type} pet report has been submitted.`,
        duration: 5000,
      });
      
      onClose();
      form.reset();
      setImages([]);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Report a Lost/Found Pet</DialogTitle>
        </DialogHeader>
        
        {/* Report Type Toggle */}
        <div className="flex border border-neutral-300 rounded-md overflow-hidden mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 px-4 font-medium ${
              form.watch('type') === 'lost' 
                ? 'bg-rose-600 text-white' 
                : 'bg-neutral-100 text-neutral-700'
            }`}
            onClick={() => form.setValue('type', 'lost')}
          >
            Lost Pet
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 px-4 font-medium ${
              form.watch('type') === 'found' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-neutral-100 text-neutral-700'
            }`}
            onClick={() => form.setValue('type', 'found')}
          >
            Found Pet
          </button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pet_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pet Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed (if known)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Golden Retriever" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Name (if known)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pet's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (if known)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Color, size, distinctive features, collar, etc." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where lost/found" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mb-4">
              <FormLabel>Upload Photos (Optional)</FormLabel>
              <div className="border-2 border-dashed border-neutral-300 rounded-md p-4 text-center">
                <Upload className="mx-auto h-10 w-10 text-neutral-400" />
                <p className="text-sm text-neutral-500 mt-1">Drag photos here or click to upload</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  multiple
                />
                <div className="flex justify-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2 text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 mt-2">You can continue without uploading photos</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
