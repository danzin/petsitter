'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingInputProps {
    value: number;
    onChange: (value: number) => void;
    maxRating?: number;
    size?: number; 
}

export function RatingInput({ value, onChange, maxRating = 5, size = 5 }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  return (
    <div className="flex space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            className={cn(
                "p-0 bg-transparent border-none cursor-pointer transition-colors",
            )}
            onClick={() => onChange(ratingValue)}
            onMouseEnter={() => setHoverValue(ratingValue)}
            onMouseLeave={() => setHoverValue(undefined)}
            >
            <Star
              className={cn(
                `w-${size} h-${size}`, 
                ratingValue <= (hoverValue || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              )}
              // strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}