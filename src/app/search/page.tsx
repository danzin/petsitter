'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SitterCard } from "@/components/search/SitterCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


type Sitter = {
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    async function searchSitters() {
      if (!searchParams.get('location')) return;
      
      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset to first page on new search
      
      try {
        // Build search filters fro params
        const filters = {
          location: searchParams.get('location'),
          startDate: searchParams.get('startDate'),
          endDate: searchParams.get('endDate'),
          services: searchParams.getAll('services'),
          maxPrice: searchParams.get('maxPrice'),
          sort: searchParams.get('sort')
        };
        
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to search for sitters');
        }
        
        const data = await response.json();
        setSitters(data.sitters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    searchSitters();
  }, [searchParams]);

  // Pagination
  const totalPages = Math.ceil(sitters.length / ITEMS_PER_PAGE);
  const paginatedSitters = sitters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results safely with TypeScript
    const resultsElement = document.querySelector('.search-results');
    if (resultsElement) {
      const yOffset = resultsElement.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({
        top: yOffset,
        behavior: 'smooth'
      });
    }
  };

  // Format date helper function
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  // Service availability summary
  const getAvailableServices = (): string[] => {
    if (!sitters.length) return [];
    
    const services = new Set<string>();
    sitters.forEach(sitter => {
      sitter.servicesOffered.forEach(service => services.add(service));
    });
    
    return Array.from(services);
  };

  // Format service name helper
  const formatService = (service: string): string => {
    return service
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Find a Pet Sitter</h2>
        <SearchForm />
      </div>
      
      <div className="mb-6 search-results">
        <h2 className="text-xl font-semibold mb-2">
          {loading ? (
            "Searching for sitters..."
          ) : sitters.length > 0 ? (
            `${sitters.length} Sitters Available`
          ) : (
            "Search Results"
          )}
        </h2>
        {searchParams.get('location') && (
          <p className="text-gray-600">
            Showing results for {searchParams.get('location')}
            {searchParams.get('startDate') && ` from ${formatDate(searchParams.get('startDate'))}`}
            {searchParams.get('endDate') && ` to ${formatDate(searchParams.get('endDate'))}`}
          </p>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {searchParams.get('location') && (
        <SearchFilters />
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : paginatedSitters.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSitters.map((sitter) => (
              <SitterCard key={sitter.id} sitter={sitter} />
            ))}
          </div>
          
          {/* Services summary */}
          {sitters.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Available Services:</h3>
              <div className="flex flex-wrap gap-2">
                {getAvailableServices().map(service => (
                  <span key={service} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {formatService(service)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : searchParams.get('location') ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No sitters found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or expanding your search area.
          </p>
          <p className="text-gray-700">
            {searchParams.get('maxPrice') && (
              <span className="block mb-2">
                Your max price filter (${searchParams.get('maxPrice')}/hr) might be too low for your area.
              </span>
            )}
            {searchParams.getAll('services').length > 0 && (
              <span className="block mb-2">
                Try selecting fewer specific services.
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Start your search</h3>
          <p className="text-gray-600 mb-4">
            Enter a location and dates to find available pet sitters.
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show current page, first, last, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === 2 && currentPage > 3) ||
                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} className="px-2 text-gray-600">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {/* Additional help section */}
      {searchParams.get('location') && sitters.length === 0 && !loading && (
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Need help finding a pet sitter?</h3>
          <p className="text-blue-700 mb-4">
            Our team can help you find the perfect match for your pet's needs.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
            Contact Support
          </button>
        </div>
      )}
      
      {/* Popular services section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Popular Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Dog Walking", icon: "🐕", description: "Regular walks for your furry friend" },
            { name: "Cat Sitting", icon: "🐱", description: "Home visits for your feline companion" },
            { name: "Pet Boarding", icon: "🏠", description: "Overnight care in a sitter's home" }
          ].map((service) => (
            <div key={service.name} className="bg-white rounded-lg shadow-md p-6 flex items-start">
              <span className="text-3xl mr-4">{service.icon}</span>
              <div>
                <h3 className="font-medium mb-1">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>      
    </div>
  );
}