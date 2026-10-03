import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getNavigationUser } from "@/lib/page-access";

export default async function AccountStatusPage() {
  const user = await getNavigationUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-xl border bg-card p-6 sm:p-8">
        <p className="text-sm font-medium text-muted-foreground">Account review</p>
        <h1 className="mt-2 text-2xl font-bold">Your account is {user.status.toLowerCase()}</h1>
        <p className="mt-3 text-muted-foreground">
          {user.status === "PENDING"
            ? "Your registration is waiting for Super Admin approval. Marketplace and account features will be available after approval."
            : "This account cannot access protected marketplace features. Contact your platform administrator if you believe this is a mistake."}
        </p>
        <p className="mt-4 text-sm">Signed in as <span className="font-medium">{user.name}</span></p>
        <Button asChild variant="outline" className="mt-6"><Link href="/">Return home</Link></Button>
      </section>
    </main>
  );
}
