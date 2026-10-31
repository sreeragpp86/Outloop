import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email address and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const res = await supabaseFetch(`profiles?select=*&email=eq.${encodeURIComponent(cleanEmail)}`);
      const users = await res.json();

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: "No account found matching this email address." },
          { status: 401 }
        );
      }

      const user = users[0];
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Local SQLite fallback
    const db = getLocalDb();
    const user = db.query(`SELECT * FROM profiles WHERE email = '${cleanEmail}'`).get() as any;

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this email address." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
