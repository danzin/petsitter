import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UserTypeSelection() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Join PetSitter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-2xl">I need a pet sitter</CardTitle>
            <CardDescription>Find trusted sitters for your furry friends</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Browse verified pet sitters in your area
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Read reviews from other pet owners
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Book securely through our platform
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/register?type=owner" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Register as Pet Owner</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-2xl">I want to be a pet sitter</CardTitle>
            <CardDescription>Earn money doing what you love</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Set your own schedule and rates
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Build a profile with reviews and photos
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Connect with pet owners in your area
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/register?type=sitter" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">Register as Pet Sitter</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-600">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}