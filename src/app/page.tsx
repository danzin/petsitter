import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchForm } from '@/components/search/SearchForm';
import { UserNavbar } from '@/components/user-navbar/UserNavbar';
import { IUser } from '../../types/utils';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main>
      <UserNavbar user ={ user as IUser }/>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Your pet's home away from home</h1>
              <p className="text-lg text-gray-600 mb-2">Connect with trusted pet sitters in your area</p>
              
              {
               !user ? (
                  <div className='container mx-auto pb-4'>
                    <div className='flex gap-3 justify-baseline'>
                      <p className='text-md text-gray-600 pt-1'>Already have an account?</p>
                      <div>
                      <Link href="/login">
                        <Button size="sm" variant="outline">Log in</Button>
                      </Link>
                      </div>
                    </div>
                  </div> ) 
                : (<></>)
              }
              
              <SearchForm/>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -right-4 -bottom-4 h-4/5 w-4/5 bg-blue-100 rounded-lg"></div>
                <img 
                  src="https://i.ibb.co/84GczdGs/dogwithsitter.jpg" 
                  alt="Happy dog with sitter" 
                  className="rounded-lg shadow-lg relative z-10 w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
       
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">

        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Sitters</h3>
              <p className="text-gray-600">Find verified pet sitters in your neighborhood.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Message sitters and schedule a meet & greet if desired.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Pay</h3>
              <p className="text-gray-600">Book and pay securely through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verified Sitters</CardTitle>
              </CardHeader>
              <CardContent>
                <p>All sitters undergo a background check and verification process.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Schedule care in just a few clicks and manage your bookings online.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Peace of Mind</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Get regular updates and photos of your pet while you're away.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Pet Owners Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">Sarah J.</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="h-4 w-4 fill-current text-yellow-500" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"I was nervous leaving my dog with a stranger, but our sitter sent us photos every day and took such great care of him. Will definitely use this service again!"</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">Mark T.</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="h-4 w-4 fill-current text-yellow-500" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"The booking process was so simple, and our cats were well taken care of. Our sitter even cleaned up the cat litter area before we got home!"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find the perfect pet sitter?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of happy pet owners who have found reliable care for their furry friends.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=owner">
              <Button size="lg" variant="secondary">Find a Sitter</Button>
            </Link>
            <Link href="/register?type=sitter">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">Become a Sitter</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}