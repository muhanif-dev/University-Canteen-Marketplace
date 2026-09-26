import { redirect } from "next/navigation";

export default function CanteenOwnerRegisterPage() {
  redirect("/register?role=canteen-owner");
}
