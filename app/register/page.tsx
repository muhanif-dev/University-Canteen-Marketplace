"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

import { CanteenOwnerRegistrationForm } from "@/components/registration/canteen-owner-form";
import { FacultyRegistrationForm } from "@/components/registration/faculty-form";
import { StudentRegistrationForm } from "@/components/registration/student-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RegistrationRole = "student" | "faculty" | "canteen-owner";

function RegisterContent() {
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role") as RegistrationRole | null;

  const [activeRole, setActiveRole] = useState<RegistrationRole>(
    queryRole === "faculty" || queryRole === "canteen-owner"
      ? queryRole
      : "student"
  );

  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Register your university profile. All registrations are verified and
            approved by the Super Admin before access is granted.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted rounded-xl mb-6 border border-border">
          <button
            type="button"
            onClick={() => setActiveRole("student")}
            className={cn(
              "py-2.5 px-3 text-sm font-semibold rounded-lg transition-all text-center",
              activeRole === "student"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("faculty")}
            className={cn(
              "py-2.5 px-3 text-sm font-semibold rounded-lg transition-all text-center",
              activeRole === "faculty"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Faculty Member
          </button>
          <button
            type="button"
            onClick={() => setActiveRole("canteen-owner")}
            className={cn(
              "py-2.5 px-3 text-sm font-semibold rounded-lg transition-all text-center",
              activeRole === "canteen-owner"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Canteen Owner
          </button>
        </div>

        {/* Form Container */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeRole === "student" && "Student Registration"}
              {activeRole === "faculty" && "Faculty Registration"}
              {activeRole === "canteen-owner" && "Canteen Owner Registration"}
            </CardTitle>
            <CardDescription>
              {activeRole === "student" &&
                "Provide your personal and student credentials to register for campus food ordering."}
              {activeRole === "faculty" &&
                "Register your faculty credentials to place priority campus food orders."}
              {activeRole === "canteen-owner" &&
                "Register your canteen establishment to start managing menus and accepting campus orders."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRole === "student" && <StudentRegistrationForm />}
            {activeRole === "faculty" && <FacultyRegistrationForm />}
            {activeRole === "canteen-owner" && <CanteenOwnerRegistrationForm />}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected university marketplace. Submitted accounts start in PENDING
          status until verified.
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Already approved? <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading registration...</p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
