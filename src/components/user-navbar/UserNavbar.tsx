
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IUser } from '../../../types/utils';


interface NavbarProps {
  user?: IUser | null;
}

export function UserNavbar({ user }: NavbarProps) {
  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <span className="text-gray-600">
          Welcome, {user.name}!
        </span>
        <Link href="/dashboard">
          <Button size="sm">Dashboard</Button>
        </Link>
      </div>
    </nav>
  );
}