import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
  cookies: {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      );
      supabaseResponse = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      );
    },
  },
    }
  );

  const mockAuth = request.cookies.get("fixflow-auth")?.value;
  const mockRole = request.cookies.get("fixflow-role")?.value;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPaths = ["/admin", "/manager", "/supervisor", "/staff", "/stakeholder", "/tenant"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !mockAuth && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (mockAuth && mockRole && isProtectedRoute) {
    const expectedPath = `/${mockRole}`;
    if (!request.nextUrl.pathname.startsWith(expectedPath)) {
      const url = request.nextUrl.clone();
      url.pathname = expectedPath;
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const expectedPath = `/${profile.role}`;
    if (!request.nextUrl.pathname.startsWith(expectedPath)) {
      const url = request.nextUrl.clone();
      url.pathname = expectedPath;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
