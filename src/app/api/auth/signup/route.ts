import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // strict password policy: > 8 chars (>= 9), uppercase, lowercase, special char
    const hasMinLength = password.length >= 9;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasSpecial) {
      return NextResponse.json(
        {
          error:
            "Password does not satisfy complexity requirements (minimum 9 characters with uppercase, lowercase, and a special character).",
        },
        { status: 400 }
      );
    }

    const displayName = company?.trim() ? `${company.trim()} / ${name.trim()}` : name.trim();

    if (isSupabaseConfigured) {
      // check for duplicate email registration
      const existingRes = await supabaseFetch(`profiles?select=id&email=eq.${encodeURIComponent(cleanEmail)}`);
      const existing = await existingRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in instead." },
          { status: 400 }
        );
      }

      const userId = randomUUID();
      const insertRes = await supabaseFetch("profiles", {
        method: "POST",
        body: JSON.stringify({
          id: userId,
          name: displayName,
          email: cleanEmail,
          role: "CUSTOMER",
        }),
      });

      if (!insertRes.ok) {
        const err = await insertRes.json();
        return NextResponse.json(
          { error: err.message || "Failed to create user account profile." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          name: displayName,
          email: cleanEmail,
          role: "CUSTOMER",
          company: company?.trim() || "Customer",
        },
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const existing = db.query(`SELECT id FROM profiles WHERE email = '${cleanEmail}'`).get();
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    const userId = randomUUID();
    db.run(
      `INSERT INTO profiles (id, name, email, role) VALUES (?, ?, ?, 'CUSTOMER')`,
      [userId, displayName, cleanEmail]
    );

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: displayName,
        email: cleanEmail,
        role: "CUSTOMER",
        company: company?.trim() || "Customer",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
