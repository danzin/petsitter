import { container } from "@/lib/container";
import { SitterService } from "@/services/SitterService";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/authContext";
import { PetSitterWithUser } from "../../../../types/utils";


async function getDataById(sitterId: string): Promise<Partial<PetSitterWithUser>> {
  const sitterService = container.resolve(SitterService);

  const sitter = await sitterService.getSitterById(sitterId);
  console.log
  if (!sitter) {
    notFound();
  }
  // This may need to change later, only testing now
  return {
      ...sitter,
      rate: sitter.rate 
  };
}


export default async function SitterProfilePage({ params }: { params: { sitterId: string } }) {
  const { sitterId } = await params;
  const sitter = await getDataById(sitterId);
  const currentUser = await getCurrentUser();

  return (
    <div className="container mx-auto py-8">
      <h1>{sitter.user?.name || 'Sitter'}'s Profile</h1>

      {/* Display rate */}
      {!sitter.rate ? ( <p>Rate: $ Opps, sitter.rate is undefined /hour</p>) : ( <p>Rate: ${sitter?.rate.toNumber()}/hour</p>) }
     


      {currentUser && currentUser.userType === 'PETOWNER' && (
        <Link href={`/bookings/new?sitterId=${sitterId}`}>
           <Button>Book {sitter.user?.name || 'this Sitter'}</Button>
        </Link>
      )}
       {!currentUser && <p>Please <Link href="/login">log in</Link> to book.</p>}
       {currentUser && currentUser.userType !== 'PETOWNER' && <p>Only Pet Owners can book services.</p>}
    </div>
  );
}