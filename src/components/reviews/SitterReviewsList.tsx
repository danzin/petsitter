import { ReviewWithAuthor } from "../../../types/review"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "../ui/badge";

interface SitterReviewsListProps {
    reviews: ReviewWithAuthor[];
    averageRating: number | null;
    totalReviews: number;
    // Add pagination controls/props later if needed
}

// Helper for initials
const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

// Helper to render stars
const renderStars = (rating: number) => {
    return (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                />
            ))}
        </div>
    );
};

export function SitterReviewsList({ reviews, averageRating, totalReviews }: SitterReviewsListProps) {
  if (totalReviews === 0) {
      return <p className="text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <h3 className="text-xl font-semibold">Reviews ({totalReviews})</h3>
        {averageRating !== null && (
          <Badge variant="secondary" className="flex items-center gap-1 text-sm">
            Average Rating: 
             {Array.from({length: Math.round(averageRating)}).map((_, index) =><Star key={index} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-card/50">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.author.image ?? undefined} />
                      <AvatarFallback>{getInitials(review.author.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.author.name || 'Anonymous Owner'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                </div>
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              {review.comment && (
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                </CardContent>
              )}
          </Card>
        ))}
      </div>
          {/* TODO: Add Pagination controls here if totalReviews > reviews.length */}
    </div>
  );
}