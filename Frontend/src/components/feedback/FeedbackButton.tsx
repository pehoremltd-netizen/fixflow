"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";
import { createFeedback } from "@/lib/store/viewerFeedback";

interface FeedbackButtonProps {
  pageLabel: string;
}

export default function FeedbackButton({ pageLabel }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    let viewerName = "Viewer";
    let viewerEmail = "";
    let uplineManagerLinkId: string | undefined;

    try {
      const sessionRaw = sessionStorage.getItem("fixflow-upline-manager-session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        viewerName = session.viewerName || viewerName;
        viewerEmail = session.viewerEmail || "";
        uplineManagerLinkId = session.token;
      }
    } catch {}

    if (!uplineManagerLinkId) {
      try {
        const raw = localStorage.getItem("fixflow-token");
        if (raw) {
          const b64 = raw.includes(".") ? raw.split(".")[1] : raw;
          const payload = JSON.parse(atob(b64));
          viewerName = payload.full_name || viewerName;
          viewerEmail = payload.email || "";
        }
      } catch {}
    }

    await createFeedback(viewerName, viewerEmail, window.location.pathname, pageLabel, text.trim(), uplineManagerLinkId);
    setText("");
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setOpen(false); }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all text-sm font-medium"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Leave a note
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-input sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Feedback — {pageLabel}
            </DialogTitle>
          </DialogHeader>
          {submitted ? (
            <p className="text-sm text-success text-center py-6">Thanks for your feedback!</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-tertiary">
                Share your thoughts, suggestions, or concerns about this page. Only Ajose will see this.
              </p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your feedback here..."
                className="min-h-[100px] text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={!text.trim()}>
                  Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
