"use client";

import { useActionState, useEffect } from "react"; 
import { useTransition } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserType } from "@prisma/client";
import { createUser } from "@/actions/createUser";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(2, { message: "Password must be at least 2 characters." }),
  location: z.string().min(1, { message: "Please enter your location." }),
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams?.get("type") === "sitter" ? UserType.PETSITTER : UserType.PETOWNER;

  const [state, formAction, isPending] = useActionState(createUser, { message: "" });

  const [isTransitionPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      location: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("location", values.location);
    formData.append("userType", userType);

    startTransition(() => {
      formAction(formData);
    });
  };

  //call signIn on successfull register
  useEffect(() => {
    if (state.success && state.email && state.password) {
      signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: true, 
        callbackUrl: state.userType === UserType.PETSITTER ? "/sitter-profile-setup" : "/dashboard",
      });
    }
  }, [state]);


  return (
    <div className="flex items-center justify-center h-screen">
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join as a {userType === UserType.PETSITTER ? "pet sitter" : "pet owner"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Country, City or State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {state?.message && <div className="text-red-500 text-sm">{state.message}</div>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending || isTransitionPending}
                >
                  {isPending || isTransitionPending ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
          </CardFooter>
          <div className="text-center pb-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}