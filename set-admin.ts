import { db, users, pool } from "./src/lib/db";
import { eq } from "drizzle-orm";

async function setAdmin() {
  try {
    const email = "client@gmail.com";
    await db
      .update(users)
      .set({ role: "ADMIN", updatedAt: new Date() })
      .where(eq(users.email, email));

    console.log(`Success: Role for ${email} updated to ADMIN`);
  } catch (error) {
    console.error("Error updating user role:", error);
  } finally {
    await pool.end();
  }
}

setAdmin();
