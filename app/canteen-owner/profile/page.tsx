import Link from "next/link";
import { redirect } from "next/navigation";

import { CanteenProfileForm } from "@/components/canteen-owner/profile-form";
import { Button } from "@/components/ui/button";
import { requireActiveCanteenOwner } from "@/lib/auth";
import { AppError } from "@/lib/errors";

async function ensureActiveOwner() {
  try {
    await requireActiveCanteenOwner();
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) {
      redirect("/register");
    }
    throw error;
  }
}

export default async function CanteenOwnerProfilePage() {
  await ensureActiveOwner();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-3 -ml-3"><Link href="/canteen-owner/dashboard">← Dashboard</Link></Button>
        <h1 className="text-3xl font-bold tracking-tight">Canteen profile</h1>
        <p className="mt-2 text-muted-foreground">Update your canteen’s details, location and opening hours.</p>
      </div>
      <CanteenProfileForm />
    </main>
  );
}
