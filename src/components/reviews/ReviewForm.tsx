'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RatingInput } from './RatingInput'; 
import { Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReviewFormProps {
    bookingId: string;
    sitterName: string; 
    onReviewSubmitted: () => void; 
}

export function ReviewForm({ bookingId, sitterName, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) {
          setError("Please select a rating.");
          return;
      }
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        await axios.post('/api/reviews', {
            bookingId,
            rating,
            comment: comment || undefined, // Send undefined if empty
        });
        setSuccess(true);
        onReviewSubmitted(); // Notify parent component
        // Optionally clear form:
        // setRating(0);
        // setComment('');
      } catch (err: any) {
        console.error("Review submission failed:", err);
        setError(err.response?.data?.message || "Failed to submit review.");
      } finally {
        setIsLoading(false);
      }
    };

    if (success) {
      return (  
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <AlertTitle>Review Submitted!</AlertTitle>
          <AlertDescription>Thank you for sharing your feedback.</AlertDescription>
        </Alert>
      );
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md bg-background">
      <h3 className="text-lg font-semibold">Leave a Review for {sitterName}</h3>
      <div>
          <Label htmlFor="rating" className="mb-2 block">Your Rating *</Label>
          <RatingInput value={rating} onChange={setRating} />
        </div>
        <div>
          <Label htmlFor="comment">Your Comments (Optional)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share your experience with ${sitterName}...`}
            rows={4}
          />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isLoading || rating === 0}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
  </form>
  );
}