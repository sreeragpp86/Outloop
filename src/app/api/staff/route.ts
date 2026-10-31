import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";
import { randomUUID } from "node:crypto";

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const res = await supabaseFetch(
        "profiles?select=*&role=in.(ADMIN,STAFF)&order=created_at.desc"
      );
      const staffList = await res.json();
      return NextResponse.json({
        staff: Array.isArray(staffList) ? staffList : [],
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const rows = db.query(
      "SELECT * FROM profiles WHERE role IN ('ADMIN', 'STAFF') ORDER BY created_at DESC"
    ).all();
    return NextResponse.json({ staff: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role = "STAFF" } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Full name and email address are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetRole = role === "ADMIN" ? "ADMIN" : "STAFF";

    if (isSupabaseConfigured) {
      // check for duplicate email address
      const existingRes = await supabaseFetch(
        `profiles?select=id&email=eq.${encodeURIComponent(cleanEmail)}`
      );
      const existing = await existingRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: "A user profile with this email address already exists." },
          { status: 400 }
        );
      }

      const staffId = randomUUID();
      const insertRes = await supabaseFetch("profiles", {
        method: "POST",
        body: JSON.stringify({
          id: staffId,
          name: name.trim(),
          email: cleanEmail,
          role: targetRole,
        }),
      });

      if (!insertRes.ok) {
        const err = await insertRes.json();
        return NextResponse.json(
          { error: err.message || "Failed to provision internal staff profile." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        staff: {
          id: staffId,
          name: name.trim(),
          email: cleanEmail,
          role: targetRole,
          created_at: new Date().toISOString(),
        },
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const existing = db.query(
      `SELECT id FROM profiles WHERE email = '${cleanEmail}'`
    ).get();

    if (existing) {
      return NextResponse.json(
        { error: "A user profile with this email address already exists." },
        { status: 400 }
      );
    }

    const staffId = randomUUID();
    db.run(
      `INSERT INTO profiles (id, name, email, role) VALUES (?, ?, ?, ?)`,
      [staffId, name.trim(), cleanEmail, targetRole]
    );

    return NextResponse.json({
      success: true,
      staff: {
        id: staffId,
        name: name.trim(),
        email: cleanEmail,
        role: targetRole,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Staff member ID is required for deletion." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      // prevent deleting primary system administrator
      const checkRes = await supabaseFetch(`profiles?select=email&id=eq.${id}`);
      const checkData = await checkRes.json();

      if (Array.isArray(checkData) && checkData[0]?.email === "admin@brightloop.io") {
        return NextResponse.json(
          { error: "The primary system administrator cannot be removed." },
          { status: 400 }
        );
      }

      const delRes = await supabaseFetch(`profiles?id=eq.${id}`, {
        method: "DELETE",
      });

      if (!delRes.ok) {
        const err = await delRes.json();
        return NextResponse.json(
          { error: err.message || "Failed to revoke staff access." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const current = db.query(`SELECT email FROM profiles WHERE id = '${id}'`).get() as any;
    if (current?.email === "admin@brightloop.io") {
      return NextResponse.json(
        { error: "The primary system administrator cannot be removed." },
        { status: 400 }
      );
    }

    db.run(`DELETE FROM profiles WHERE id = '${id}'`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
