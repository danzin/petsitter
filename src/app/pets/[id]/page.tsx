"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pet() {
  const params = useParams();
  const {id} = params
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      fetchPet();
    }, []);

   const  fetchPet = async () => {
    setIsLoading(true);
    const response = await axios.get(`/api/pets/${id}`);
    console.log(response)
    console.log(id)

   }

   return (
    <div className="space-y-6">
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Pets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div>
  
          </div>
        </CardContent>
      </Card>
    </div>
   )
} 