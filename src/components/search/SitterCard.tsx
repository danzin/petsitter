import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type SitterCardProps = {
  sitter: {
    id: string;
    userId: string;
    experience: string | null;
    rate: number;
    servicesOffered: string[];
    availability: any;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      name?: string;
      image?: string;
      location?: string;
    };
  };
};

export function SitterCard({ sitter }: SitterCardProps) {
  // get initials from name or userId
  const getInitials = (name?: string) => {
    if (!name) return "PS"; // Pet Sitter
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  //format service names
  const formatService = (service: string) => {
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Use user data if available, otherwise use sitter data
  const displayName = sitter.user?.name || `Sitter ${sitter.id.substring(0, 6)}`;
  const location = sitter.user?.location || "Location not specified";
  const imageUrl = sitter.user?.image;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageUrl} alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            <p className="text-gray-600 text-sm">{location}</p>
          </div>
        </div>
        
        {sitter.experience && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {sitter.experience}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {sitter.servicesOffered.map((service) => (
            <Badge key={service} variant="secondary">
              {formatService(service)}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="font-medium">
            ${sitter.rate}/hr
          </div>
          <a 
            href={`/sitters/${sitter.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            View Profile
          </a>
        </div>
      </CardContent>
    </Card>
  );
}