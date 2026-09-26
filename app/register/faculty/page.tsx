import { redirect } from "next/navigation";

export default function FacultyRegisterPage() {
  redirect("/register?role=faculty");
}
