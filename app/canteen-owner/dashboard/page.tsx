import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireActiveCanteenOwner } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";

async function getActiveOwner() {
  try {
    return await requireActiveCanteenOwner();
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 401 || error.statusCode === 403)) {
      redirect("/register");
    }
    throw error;
  }
}

export default async function CanteenOwnerDashboardPage() {
  const { session } = await getActiveOwner();
  await connectDB();
  const canteen = await Canteen.findOne({ owner: session.userId })
    .select("canteenName description location building openingTime closingTime isApproved isActive")
    .lean();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Canteen owner workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your canteen profile and keep its information current.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/canteen-owner/profile">Manage profile</Link></Button>
          <Button asChild variant="outline"><Link href="/canteen-owner/categories">Categories</Link></Button>
          <Button asChild variant="outline"><Link href="/canteen-owner/products">Products</Link></Button>
          <Button asChild variant="outline"><Link href="/canteen-owner/orders">Orders</Link></Button>
        </div>
      </div>
      {canteen ? (
        <Card>
          <CardHeader>
            <CardTitle>{canteen.canteenName}</CardTitle>
            <CardDescription>{canteen.location} · {canteen.building}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6">{canteen.description}</p>
            <div className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Opening hours</span><br />{canteen.openingTime}–{canteen.closingTime}</p>
              <p><span className="font-medium">Profile status</span><br />{canteen.isApproved && canteen.isActive ? "Approved and active" : "Awaiting approval or activation"}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Set up your canteen profile</CardTitle><CardDescription>Your account is active, but no canteen profile is linked yet.</CardDescription></CardHeader>
          <CardContent><Button asChild><Link href="/canteen-owner/profile">Create canteen profile</Link></Button></CardContent>
        </Card>
      )}
    </main>
  );
}
