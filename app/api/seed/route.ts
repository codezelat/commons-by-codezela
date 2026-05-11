import { auth } from "@/lib/auth";
import { execute } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function isLocalSeedAllowed(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const seedSecret = process.env.SEED_ROUTE_SECRET;
  if (seedSecret && request.headers.get("x-seed-secret") !== seedSecret) {
    return false;
  }

  const host = request.headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export async function POST(request: NextRequest) {
  if (!isLocalSeedAllowed(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "info@codezela.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    return NextResponse.json(
      {
        error:
          "Set SEED_ADMIN_PASSWORD to a strong local seed password before using this route.",
      },
      { status: 400 },
    );
  }

  try {
    // Create admin user via Better Auth
    const ctx = await auth.api.signUpEmail({
      body: {
        name: "Codezela Admin",
        email: adminEmail,
        password: adminPassword,
      },
    });

    if (!ctx || !ctx.user) {
      return NextResponse.json(
        { error: "Failed to create admin user" },
        { status: 500 },
      );
    }

    // Set role to admin
    await execute(`UPDATE "user" SET role = 'admin', "emailVerified" = TRUE WHERE id = $1`, [
      ctx.user.id,
    ]);

    return NextResponse.json({
      message: "Admin user seeded",
      email: adminEmail,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // If user already exists that's fine
    if (
      message.includes("unique") ||
      message.includes("duplicate") ||
      message.includes("already")
    ) {
      return NextResponse.json({ message: "Admin user already exists" });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
