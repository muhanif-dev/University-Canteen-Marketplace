import { redirect } from "next/navigation";

import { CategoryManager } from "@/components/canteen-owner/category-manager";
import { requireActiveCanteenOwner } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export default async function OwnerCategoriesPage() {
  try {
    await requireActiveCanteenOwner();
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) redirect("/register");
    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Categories</h1><p className="mt-2 text-muted-foreground">Organize your menu into clear, easy-to-browse groups.</p></div>
      <CategoryManager />
    </main>
  );
}
