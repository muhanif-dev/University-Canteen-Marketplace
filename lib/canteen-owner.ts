import { requireActiveCanteenOwner } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";

export async function requireOwnedCanteen() {
  const { session } = await requireActiveCanteenOwner();
  await connectDB();
  const canteen = await Canteen.findOne({ owner: session.userId });

  if (!canteen) {
    throw new NotFoundError("Canteen profile not found");
  }

  return { session, canteen };
}
