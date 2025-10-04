"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LoginSchema } from "@/lib/schemas";
import { login } from "@/lib/actions/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock } from "lucide-react";
import { Logo } from "../Logo";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      login(values).then((data) => {
        if (data.error) {
          form.reset();
          toast({
            title: "Login Error",
            description: data.error,
            variant: "destructive",
          });
        }
        if (data.success && data.token) {
          toast({
            title: "Success",
            description: data.success,
          });
          // Store the token
          localStorage.setItem("authToken", data.token);
          // Force a refresh of the page to ensure all components update
          window.location.href = "/dashboard";
        }
      });
    });
  };

  return (
    <div className="w-full max-w-sm bg-card p-8 rounded-lg shadow-xl">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo className="h-8 w-auto mb-6" />
        <h1 className="text-3xl font-bold tracking-tight">Log In</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to HU Connect, sign in to continue.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="student@gmail.com"
                      {...field}
                      disabled={isPending}
                      type="email"
                      className="pl-10"
                    />
                  </div>
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
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      type="password"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <div className="flex justify-end">
                  <Button
                    variant="link"
                    asChild
                    className="p-0 h-auto font-semibold text-primary"
                  >
                    <Link href="/forgot-password">Forgot Password?</Link>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log In
          </Button>
        </form>
      </Form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
