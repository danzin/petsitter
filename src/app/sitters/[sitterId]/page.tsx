import 'server-only';
import { container } from "@/lib/container";
import { SitterService } from "@/services/SitterService";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/authContext"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, CircleDollarSign, Briefcase, User as UserIcon, Sparkles, CalendarDays, Star, MessageSquare } from 'lucide-react'; 
import { ReviewService } from "@/services/ReviewService"; 
import { SitterReviewsList } from "@/components/reviews/SitterReviewsList"; 
import { SitterProfileData, SitterProfilePageData } from '../../../../types/sitter.';



async function getDataById(sitterId: string): Promise<SitterProfilePageData> {
  if (!sitterId) {
    console.error("getDataById called without a sitterId!");
    notFound();
  }
  const sitterService = container.resolve(SitterService);
  const reviewService = container.resolve(ReviewService); 
  
  const sitter = await sitterService.getSitterById(sitterId);
  if(!sitter || !sitter.user){
    console.log(`Sitter or associated user not found for ID: ${sitterId}`);
    notFound();
  }

  const reviewsResult = await reviewService.getReviewsForSitter(
    sitter.user.id as  string, 1, 5  
  );



  if (!sitter || !sitter.user) {
    console.log(`Sitter or associated user not found for ID: ${sitterId}`);
    notFound();
  }

  
  return {
    ...(sitter as SitterProfileData),
    reviewsResult: reviewsResult ?? { reviews: [], total: 0, averageRating: null },

  }
}


const getInitials = (name?: string | null) => {
  if (!name) return "PS"; // Pet Sitter
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

const formatService = (service: string) => {
  return service
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default async function SitterProfilePage({ params }: { params: { sitterId: string } }) {
  const { sitterId } = await params; 
  const data = await getDataById(sitterId);
  const sitter = data;
  const reviewsResult = data.reviewsResult;
  const currentUser = await getCurrentUser();
  const displayRate = sitter.rate?.toNumber() ?? null; 

  return (
    <div className="container mx-auto py-8 lg:py-12">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* --- Left Column - Sitter Info  --- */}
        <Card className="lg:col-span-1 sticky top-8">
          <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                  <AvatarImage src={sitter.user.image ?? undefined} alt={sitter.user.name ?? 'Sitter'} />
                  <AvatarFallback className="text-3xl">{getInitials(sitter.user.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{sitter.user.name || 'Pet Sitter'}</CardTitle>
              {sitter.user.location && (
                  <CardDescription className="flex items-center justify-center text-sm">
                      <MapPin className="w-4 h-4 mr-1 text-muted-foreground" /> {sitter.user.location}
                  </CardDescription>
              )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {displayRate !== null ? (
              <div className="flex items-center justify-center font-semibold text-xl">
                  <CircleDollarSign className="w-5 h-5 mr-1.5 text-green-600" />
                  ${displayRate.toFixed(2)} / hour
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Rate not set</p>
            )}
            <Separator />
          {/* Rating */}
            <div className="text-sm text-muted-foreground">
              {reviewsResult.averageRating ? (
                <p className='flex items-center justify-center'>
                  <Badge variant="secondary" className="flex items-center gap-1 text-sm">
                    {Array.from({length: Math.round(reviewsResult.averageRating)}).map((_, index) =><Star key={index} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </Badge>
                </p>
                ) : (<p>No reviews yet.</p>)
              }
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
              {/* --- Booking Button --- */}
              {currentUser && currentUser.userType === 'PETOWNER' && (
                  <Link href={`/bookings/new?sitterId=${sitter.id}`} className="w-full"> 
                      <Button className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4"/> Request Booking
                      </Button>
                  </Link>
              )}
              {!currentUser && (
                    <div className="text-center text-sm w-full">
                      <p>Please <Link href={`/login?callbackUrl=/sitters/${sitter.id}`} className="font-medium text-primary hover:underline">log in</Link> as a Pet Owner to book.</p>
                  </div>
              )}
              {currentUser && currentUser.userType !== 'PETOWNER' && (
                    <div className="text-center text-sm w-full">
                      <p className="text-muted-foreground">Only Pet Owners can book services.</p>
                    </div>
              )}
          </CardFooter>
        </Card>

        {/* --- Right column - Details --- */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          {sitter.user.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <UserIcon className="w-5 h-5 mr-2 text-primary" /> About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{sitter.user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
            {sitter.experience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" /> Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{sitter.experience}</p>
                </CardContent>
              </Card>
            )}


          {/* Services */}
          {sitter.servicesOffered && sitter.servicesOffered.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Sparkles className="w-5 h-5 mr-2 text-primary" /> Services Offered
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                    {sitter.servicesOffered.map(service => (
                        <Badge key={service} variant="secondary">{formatService(service)}</Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CalendarDays className="w-5 h-5 mr-2 text-primary" /> Availability
                </CardTitle>
            </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  (Availability display coming soon. Check booking form for dates.)
                </p>
              </CardContent>
          </Card>

          {/* Reviews  */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                  <Star className="w-5 h-5 mr-2 text-primary" /> Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SitterReviewsList
                reviews={reviewsResult.reviews}
                averageRating={reviewsResult.averageRating}
                totalReviews={reviewsResult.total}
              />
            </CardContent>
          </Card>

        </div> 
      </div> 
    </div> 
  );
}