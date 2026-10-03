import { RegistrationManager } from "@/components/admin/registration-manager";
import { requirePageRoles } from "@/lib/page-access";
import { ROLES } from "@/types";

export default async function AdminRegistrationsPage() {
  await requirePageRoles([ROLES.SUPER_ADMIN]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">Platform administration</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Registration requests</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Review submitted student, faculty, and canteen owner accounts.</p>
      <div className="mt-8"><RegistrationManager /></div>
    </main>
  );
}
