"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pet } from "@prisma/client";
import Link from "next/link";


const initialPetState: Partial<Pet> = {
  name: "",
  type: "",
  breed: "",
  age: null,  
  description: "",
  imageUrl: "",
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPetDialog, setShowAddPetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [newPet, setNewPet] = useState(initialPetState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/pets");
      setPets(response.data.pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      setError("Failed to load pets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (editingPet) {
        // Update existing pet
        await axios.put(`/api/pets/${editingPet.id}`, newPet);
      } else {
        // Add new pet
        await axios.post("/api/pets", newPet);
      }
      
      // Refresh pet list
      fetchPets();
      // Reset form
      setNewPet(initialPetState);
      setShowAddPetDialog(false);
      setEditingPet(null);
    } catch (error: any) {
      console.error("Error saving pet:", error);
      setError(error.response?.data?.message || "Failed to save pet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setNewPet({
      name: pet.name,
      type: pet.type,
      breed: pet.breed ?? "",
      age: pet.age ?? null ,
      description: pet.description || "",
      imageUrl: pet.imageUrl || "",
    });
    setShowAddPetDialog(true);
  };

  const handleDelete = async () => {
    if (!petToDelete) return;
    
    try {
      await axios.delete(`/api/pets/${petToDelete}`);
      setPets(pets.filter(pet => pet.id !== petToDelete));
      setShowDeleteDialog(false);
      setPetToDelete(null);
    } catch (error) {
      console.error("Error deleting pet:", error);
      setError("Failed to delete pet. Please try again.");
    }
  };

  const confirmDelete = (petId: string) => {
    setPetToDelete(petId);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex content-start my-3">
        <Link href='/dashboard'>
          <Button>
            Back to Dashboard
          </Button>
        </Link>
      </div>      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Pets</CardTitle>
            <CardDescription>Manage your pets information and profiles</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingPet(null);
            setNewPet(initialPetState);
            setShowAddPetDialog(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Pet
          </Button>
         

        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          {pets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">No image</div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{pet.name}</h3>
                        <p className="text-sm text-gray-500">
                          {pet.type} {pet.breed ? `• ${pet.breed}` : ""}
                        </p>
                        {pet.age && <p className="text-sm text-gray-500">Age: {pet.age} years</p>}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pet)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(pet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {pet.description && (
                      <p className="text-sm mt-2 line-clamp-2">{pet.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12">
              <p className="text-gray-500 mb-4">You don't have any pets yet.</p>
              <Button onClick={() => {
                setNewPet(initialPetState);
                setShowAddPetDialog(true);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Pet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Pet Dialog */}
      <Dialog open={showAddPetDialog} onOpenChange={setShowAddPetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPet ? "Edit Pet" : "Add New Pet"}</DialogTitle>
            <DialogDescription>
              {editingPet 
                ? "Update your pet's information below." 
                : "Enter your pet's details to add them to your profile."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Pet Name*</Label>
                <Input
                  id="name"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="Enter pet's name"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Pet Type*</Label>
                <Select 
                  value={newPet.type} 
                  onValueChange={(value) => setNewPet({ ...newPet, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Fish">Fish</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Small Animal">Small Animal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="breed">Breed (Optional)</Label>
                <Input
                  id="breed"
                  value={newPet.breed ?? ""}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="Enter breed"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="age">Age in Years (Optional)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  value={newPet.age || ""}
                  onChange={(e) => setNewPet({ ...newPet, age: parseInt(e.target.value) || undefined })}
                  placeholder="Enter age"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newPet.description ?? ""}
                  onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                  placeholder="Add special notes, medical information, or personality traits"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={newPet.imageUrl ?? ""}
                  onChange={(e) => setNewPet({ ...newPet, imageUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddPetDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPet ? "Update Pet" : "Add Pet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pet's profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}