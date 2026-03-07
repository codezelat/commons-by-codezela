import { auth } from "@/lib/auth";
import { execute } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create admin user via Better Auth
    const ctx = await auth.api.signUpEmail({
      body: {
        name: "Codezela Admin",
        email: "info@codezela.com",
        password: "password",
      },
    });

    if (!ctx || !ctx.user) {
      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 }
      );
    }

    // Set role to admin
    await execute(`UPDATE "user" SET role = 'admin' WHERE id = $1`, [
      ctx.user.id,
    ]);

    return NextResponse.json({
      message: "Admin user seeded",
      email: "info@codezela.com",
      password: "password",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // If user already exists that's fine
    if (message.includes("unique") || message.includes("duplicate") || message.includes("already")) {
      return NextResponse.json({ message: "Admin user already exists" });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
