"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let listener;
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => setUser(data.user || null)).catch(() => setUser(null));
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      listener = result.data?.subscription;
    } catch {
      // Keep public navigation usable even when Supabase environment variables
      // are temporarily missing from a Vercel deployment.
      setUser(null);
    }
    return () => listener?.unsubscribe();
  }, []);

  return (
    <nav className="nav">
      <Link className="brand" href="/">BizLink</Link>
      <div className="navlinks">
        <Link href="/businesses">Businesses</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/dashboard">Dashboard</Link>
        {user ? (
          <Link className="btn" href="/dashboard">My account</Link>
        ) : (
          <>
            <Link href="/signup">Sign up</Link>
            <Link className="btn" href="/login">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}
