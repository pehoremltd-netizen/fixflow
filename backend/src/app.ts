import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/error-handler";

import authRoutes from "./routes/auth";
import workOrderRoutes from "./routes/work-orders";
import assetRoutes from "./routes/assets";
import siteRoutes from "./routes/sites";
import inspectionRoutes from "./routes/inspections";
import attendanceRoutes from "./routes/attendance";
import inventoryRoutes from "./routes/inventory";
import contractRoutes from "./routes/contracts";
import maintenanceRequestRoutes from "./routes/maintenance-requests";
import profileRoutes from "./routes/profiles";
import organizationRoutes from "./routes/organizations";
import dashboardRoutes from "./routes/dashboard";
import uploadRoutes from "./routes/upload";
import utilityRoutes from "./routes/utilities";
import notificationRoutes from "./routes/notifications";
import qrCodeRoutes from "./routes/qr-codes";
import faultReportRoutes from "./routes/fault-reports";
import pmScheduleRoutes from "./routes/pm-schedule";
import contractorRoutes from "./routes/contractors";
import uplineManagerRoutes from "./routes/upline-manager";
import artisanRoutes from "./routes/artisans";
import dieselManagementRoutes from "./routes/diesel-management";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://fixflow-cmms.vercel.app",
    /\.vercel\.app$/,
    config.frontendUrl,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/maintenance-requests", maintenanceRequestRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/utilities", utilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/qr-codes", qrCodeRoutes);
app.use("/api/fault-reports", faultReportRoutes);
app.use("/api/pm-schedule", pmScheduleRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/upline-manager", uplineManagerRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/diesel-management", dieselManagementRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "FixFlow API",
    version: "1.0.0",
    status: "running",
    docs: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
