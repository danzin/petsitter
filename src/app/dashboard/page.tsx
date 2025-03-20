"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserType } from "@prisma/client";
import PetOwnerDashboard from "@/components/dashboard/PetOwnerDashboard";
import PetSitterDashboard from "@/components/dashboard/PetSitterDashboard";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import RoleSwitch from "@/components/role-switch/RoleSwitch";
import axios from "axios";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Fetch user details including userType
      axios.get("/api/user/me").then((response) => {
        setUserType(response.data.userType);
        setIsLoading(false);
      }).catch(error => {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      });
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, router]);

  // Handle role switching
  const switchRole = async (newRole: UserType) => {
    if (newRole === userType) return;
    
    try {
      setIsLoading(true);
      await axios.post("/api/user/switch-role", { userType: newRole });
      
      // If switching to pet sitter for the first time, redirect to profile setup
      if (newRole === UserType.PETSITTER) {
        const response = await axios.get("/api/sitter-profile/check");
        if (!response.data.profileExists) {
          router.push("/sitter-profile-setup");
          return;
        }
      }
      
      setUserType(newRole);
      setIsLoading(false);
    } catch (error) {
      console.error("Error switching role:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2/></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <div className="flex gap-4">
          <RoleSwitch userType={userType as UserType } switchRole={switchRole}/>
        </div>
      </div>

      {userType === UserType.PETOWNER && <PetOwnerDashboard />}
      {userType === UserType.PETSITTER && <PetSitterDashboard />}
    </div>
  );
}