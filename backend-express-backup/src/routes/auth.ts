import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { supabase } from "../lib/supabase";
import { config } from "../config";
import { authenticate } from "../middleware/auth";
import { sendWelcomeEmail, sendAdminConfirmation } from "../lib/mail";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  // Use GoTrue REST API directly (service_role key cannot do password grant)
  const gotrueRes = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.supabaseAnonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!gotrueRes.ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const gotrueData: any = await gotrueRes.json();
  const userId: string = gotrueData.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, email, full_name, role, avatar_url, is_active")
    .eq("id", userId)
    .single();

  if (!profile || !profile.is_active) {
    res.status(403).json({ error: "Account is inactive or not found" });
    return;
  }

  const token = jwt.sign(
    { sub: profile.id, email: profile.email, role: profile.role, organization_id: profile.organization_id },
    config.jwtSecret,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      organization_id: profile.organization_id,
    },
  });
});

router.post("/register", authenticate, async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Only admins can create users" });
    return;
  }
  const { email, full_name, organization_id, role } = req.body;
  if (!email || !full_name) {
    res.status(400).json({ error: "Email and full_name are required" });
    return;
  }

  const tempPassword = crypto.randomBytes(4).toString("hex") + "!A1";
  const adminEmail = req.user?.email || "";

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name, role: role || "staff" },
  });

  if (authError || !authData.user) {
    res.status(400).json({ error: authError?.message || "Failed to create user" });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: authData.user.id,
      email,
      full_name,
      role: role || "staff",
      organization_id: organization_id || null,
    }, { onConflict: "id" })
    .select("id, organization_id, email, full_name, role, avatar_url")
    .single();

  if (profileError || !profile) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    res.status(500).json({ error: "Failed to create profile" });
    return;
  }

  // Generate password-reset token
  const resetToken = jwt.sign(
    { sub: profile.id, purpose: "password-reset" },
    config.jwtSecret,
    { expiresIn: "1h" },
  );

  // Send welcome email (blocking — surface errors properly)
  let emailSent = false;
  let emailError = "";
  try {
    console.log(`Sending welcome email to ${email}...`);
    await sendWelcomeEmail(email, full_name, email, tempPassword, resetToken);
    console.log(`Welcome email sent successfully to ${email}`);
    emailSent = true;

    // Also notify admin
    if (adminEmail) {
      sendAdminConfirmation(adminEmail, full_name, email, role || "staff").catch((e) =>
        console.error("Failed to send admin confirmation:", e?.message || e),
      );
    }
  } catch (e: any) {
    console.error("Failed to send welcome email:", JSON.stringify({ message: e?.message, code: e?.code, response: e?.response }, null, 2));
    emailError = e?.message || "Unknown SMTP error";
    if (e?.code === "EAUTH") emailError = "SMTP authentication failed - check Gmail app password";
    else if (e?.code === "ESOCKET") emailError = "Cannot connect to SMTP server - check network/firewall";
    else if (e?.response) emailError += ` (SMTP: ${e.response})`;
  }

  res.status(201).json({
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      organization_id: profile.organization_id,
    },
    tempPassword,
    message: emailSent
      ? "User created. Welcome email sent."
      : `User created but welcome email failed: ${emailError}. Temp password: ${tempPassword}`,
  });
});

router.post("/set-password-from-reset", async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }

  let payload: { sub: string; purpose: string };
  try {
    payload = jwt.verify(token, config.jwtSecret) as { sub: string; purpose: string };
  } catch {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  if (payload.purpose !== "password-reset") {
    res.status(400).json({ error: "Invalid reset token" });
    return;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(payload.sub, { password });
  if (updateError) {
    res.status(400).json({ error: updateError.message });
    return;
  }

  res.json({ message: "Password updated successfully" });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const gotrueRes = await fetch(`${config.supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.supabaseAnonKey,
    },
    body: JSON.stringify({ email }),
  });

  if (!gotrueRes.ok) {
    const body = await gotrueRes.json() as { msg?: string };
    res.status(400).json({ error: body.msg || "Failed to send reset email" });
    return;
  }

  res.json({ message: "Password reset email sent" });
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and new password are required" });
    return;
  }

  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    res.status(500).json({ error: listError.message });
    return;
  }

  const user = users.users.find((u: any) => u.email === email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
  if (updateError) {
    res.status(400).json({ error: updateError.message });
    return;
  }

  res.json({ message: "Password updated successfully" });
});

router.get("/me", async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, organization_id, email, full_name, role, avatar_url")
      .eq("id", payload.sub)
      .single();

    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: profile });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
