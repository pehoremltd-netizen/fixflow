import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  const orgId = req.query.organization_id as string;
  if (!orgId) {
    res.status(400).json({ error: "organization_id is required" });
    return;
  }

  const [
    { count: totalWorkOrders },
    { count: openWorkOrders },
    { count: completedWorkOrders },
    { count: pendingInspections },
    { count: totalAssets },
    { count: activeStaff },
    { data: attendanceData },
    { count: overdueTasks },
  ] = await Promise.all([
    supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("organization_id", orgId).in("status", ["pending", "approved", "in-progress"]),
    supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "completed"),
    supabase.from("inspections").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "draft"),
    supabase.from("assets").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_active", true).in("role", ["staff", "supervisor"]),
    supabase.from("attendance").select("verified").eq("organization_id", orgId).gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("organization_id", orgId).lt("due_date", new Date().toISOString()).not("status", "eq", "completed"),
  ]);

  const totalAttendance = attendanceData?.length || 0;
  const verifiedAttendance = attendanceData?.filter((a) => a.verified).length || 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((verifiedAttendance / totalAttendance) * 100) : 0;

  res.json({
    data: {
      totalWorkOrders: totalWorkOrders || 0,
      openWorkOrders: openWorkOrders || 0,
      completedWorkOrders: completedWorkOrders || 0,
      pendingInspections: pendingInspections || 0,
      totalAssets: totalAssets || 0,
      activeStaff: activeStaff || 0,
      attendanceRate,
      overdueTasks: overdueTasks || 0,
    },
  });
});

export default router;
