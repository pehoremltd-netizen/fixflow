"use client";

import { useEffect } from "react";
import { runMigrations } from "@/lib/migrations";

export default function MigrationRunner() {
  useEffect(() => {
    runMigrations();
  }, []);
  return null;
}
