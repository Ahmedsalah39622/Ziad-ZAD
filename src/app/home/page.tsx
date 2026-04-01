import { redirect } from "next/navigation";

export const revalidate = 3600; // Cache for 1 hour

export default function HomePage() {
  redirect("/");
}
