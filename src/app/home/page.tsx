import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const revalidate = 3600; // Cache for 1 hour

export default function HomePage() {
  redirect("/");
}
