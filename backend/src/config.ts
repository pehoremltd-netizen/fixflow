import dotenv from "dotenv";
dotenv.config();

export const config = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "fixflow-jwt-secret",
  port: parseInt(process.env.PORT || "4000", 10),
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
