import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your university canteen account.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use the email and password from your registration.</CardDescription>
          </CardHeader>
          <CardContent><LoginForm /></CardContent>
        </Card>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to the marketplace? <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
