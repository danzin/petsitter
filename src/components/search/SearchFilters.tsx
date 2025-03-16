import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentPrice = searchParams.get('maxPrice') ? 
    parseInt(searchParams.get('maxPrice') as string) : 100;
  

  const [priceRange, setPriceRange] = useState<number>(currentPrice);
  

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (priceRange < 100) {
      params.set('maxPrice', priceRange.toString());
    } else {
      params.delete('maxPrice');
    }
    
    router.push(`/search?${params.toString()}`);
  };
  
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div className="mb-4 md:mb-0">
        <Select 
          value={currentSort} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="md:flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mr-2">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Results</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price-range">Max Price: ${priceRange}/hr</Label>
                </div>
                <Slider
                  id="price-range"
                  min={10}
                  max={100}
                  step={5}
                  value={[priceRange]}
                  onValueChange={(value) => setPriceRange(value[0])}
                />
              </div>
              
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="text-sm text-gray-500">
          {searchParams.get('maxPrice') ? (
            <span>
              Filters applied: 
              {searchParams.get('maxPrice') && ` Max $${searchParams.get('maxPrice')}/hr`}
            </span>
          ) : (
            <span>No filters applied</span>
          )}
        </div>
      </div>
    </div>
  );
}