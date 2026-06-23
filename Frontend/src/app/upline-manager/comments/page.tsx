"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getCommentsForLink,
  addComment,
} from "@/lib/store/uplineManagerComments";
import type { UplineManagerComment } from "@/types";
import {
  MessageSquare,
  Send,
  User,
  Shield,
  RefreshCw,
  Clock,
} from "lucide-react";

export default function UplineManagerCommentsPage() {
  const [linkId, setLinkId] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState("Viewer");
  const [comments, setComments] = useState<UplineManagerComment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("fixflow-upline-manager-session");
      if (raw) {
        const s = JSON.parse(raw);
        setLinkId(s.token);
        setViewerName(s.viewerName || "Viewer");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (linkId) {
      getCommentsForLink(linkId).then(setComments);
    }
  }, [linkId]);

  const refresh = () => {
    if (linkId) getCommentsForLink(linkId).then(setComments);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !linkId) return;
    await addComment({
      uplineManagerLinkId: linkId,
      itemType: "general",
      itemId: "um-comments",
      authorType: "upline_manager",
      authorName: viewerName,
      commentText: text.trim(),
    });
    setText("");
    refresh();
  };

  if (!linkId) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comments</h1>
          <p className="text-secondary-foreground">Your conversation with Ajose</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            All Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No comments yet. Start a conversation below.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {comments
                .slice()
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-lg border p-3",
                      c.authorType === "ajose"
                        ? "border-primary/30 bg-primary/5 ml-4"
                        : "border-border bg-card-alt"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      {c.authorType === "ajose" ? (
                        <Shield className="h-3 w-3 text-primary" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="font-medium text-foreground">{c.authorName}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}</span>
                      {c.itemType !== "general" && (
                        <>
                          <span>·</span>
                          <Badge variant="outline" className="text-[9px]">{c.itemType.replace(/_/g, " ")}</Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{c.commentText}</p>
                  </motion.div>
                ))}
            </div>
          )}

          <div className="pt-3 border-t border-border space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Write a message to Ajose, ${viewerName}...`}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" className="gap-1" onClick={handleSubmit} disabled={!text.trim()}>
                <Send className="h-3.5 w-3.5" /> Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
