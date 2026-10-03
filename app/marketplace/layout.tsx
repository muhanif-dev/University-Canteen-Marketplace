import { requirePageRoles } from "@/lib/page-access";
import { ROLES } from "@/types";

export default async function MarketplaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageRoles([ROLES.STUDENT, ROLES.FACULTY]);
  return children;
}
