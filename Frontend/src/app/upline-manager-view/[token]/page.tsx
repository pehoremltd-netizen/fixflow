"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLinkByToken, updateLastAccessed } from "@/lib/store/uplineManagerLinks";
import { Loader2, AlertCircle } from "lucide-react";

export default function UplineManagerViewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      const link = await getLinkByToken(token);
      if (!link) {
        setError("Invalid access link.");
        return;
      }
      if (link.status !== "active") {
        setError("This access link has been revoked.");
        return;
      }

      await updateLastAccessed(token);

        sessionStorage.setItem(
        "fixflow-upline-manager-session",
        JSON.stringify({
          viewerName: link.viewerName,
          viewerEmail: link.viewerEmail,
          token: link.token,
        })
      );

      router.replace("/upline-manager");
    })();
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-sm mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-text-tertiary">{error}</p>
          <p className="text-xs text-text-tertiary">
            Please contact Ajose for a new access link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
        <p className="text-sm text-text-tertiary">Verifying access link...</p>
      </div>
    </div>
  );
}
