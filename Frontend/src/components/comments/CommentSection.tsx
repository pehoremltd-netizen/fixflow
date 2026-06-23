"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addComment,
  getCommentsForItem,
  getCommentsByItemType,
  markThreadAsRead,
} from "@/lib/store/uplineManagerComments";
import type { UplineManagerComment } from "@/types";
import { MessageSquare, Send, User, Shield, ChevronDown, ChevronUp } from "lucide-react";

interface CommentSectionProps {
  itemType: string;
  itemId: string;
  uplineManagerLinkId?: string;
  isAjose?: boolean;
  currentUserName?: string;
}

export default function CommentSection({
  itemType,
  itemId,
  uplineManagerLinkId,
  isAjose,
  currentUserName,
}: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<UplineManagerComment[]>([]);
  const [text, setText] = useState("");
  const [displayLinkId, setDisplayLinkId] = useState<string | undefined>(uplineManagerLinkId);

  useEffect(() => {
    if (!displayLinkId && !isAjose) {
      try {
        const raw = sessionStorage.getItem("fixflow-upline-manager-session");
        if (raw) {
          const s = JSON.parse(raw);
          setDisplayLinkId(s.token);
        }
      } catch {}
    }
  }, [displayLinkId, isAjose]);

  const loadComments = () => {
    if (isAjose) {
      getCommentsByItemType(itemType).then((all) =>
        setComments(all.filter((c) => c.itemId === itemId))
      );
    } else if (displayLinkId) {
      getCommentsForItem(itemType, itemId, displayLinkId).then(setComments);
    }
  };

  useEffect(() => {
    if (!expanded) return;
    loadComments();
  }, [expanded, itemType, itemId, displayLinkId, isAjose]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!displayLinkId && isAjose) {
      const first = comments.find((c) => c.uplineManagerLinkId);
      if (!first) return;
      await addComment({
        uplineManagerLinkId: first.uplineManagerLinkId,
        itemType,
        itemId,
        authorType: "ajose",
        authorName: currentUserName || "Ajose",
        commentText: text.trim(),
      });
    } else if (displayLinkId) {
      await addComment({
        uplineManagerLinkId: displayLinkId,
        itemType,
        itemId,
        authorType: isAjose ? "ajose" : "upline_manager",
        authorName: currentUserName || (isAjose ? "Ajose" : "Viewer"),
        commentText: text.trim(),
      });
    }
    setText("");
    loadComments();
  };

  if (!isAjose && !displayLinkId) return null;

  return (
    <div className="border-t border-border pt-4 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-text-tertiary hover:text-foreground transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-text-tertiary italic">No comments yet.</p>
          )}

          {isAjose && (
            <div className="space-y-1 mb-2">
              {Array.from(new Set(comments.map((c) => c.uplineManagerLinkId))).map((linkId) => {
                const linkComments = comments.filter((c) => c.uplineManagerLinkId === linkId);
                const viewerName = linkComments.find((c) => c.authorType === "upline_manager")?.authorName || "Viewer";
                return (
                  <div key={linkId} className="rounded-lg border border-primary/20 bg-primary/5 p-2">
                    <p className="text-xs font-medium text-primary mb-1">{viewerName}'s thread:</p>
                    {linkComments.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "rounded border p-2 mb-1.5",
                          c.authorType === "ajose"
                            ? "border-primary/20 bg-primary/5 ml-3"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                          {c.authorType === "ajose" ? (
                            <Shield className="h-3 w-3 text-primary" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          <span className="font-medium text-foreground">{c.authorName}</span>
                          <span>·</span>
                          <span>{new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}</span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.commentText}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-1">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={`Reply to ${viewerName}...`}
                        className="min-h-[50px] text-sm flex-1"
                      />
                      <Button
                        size="sm"
                        className="self-end gap-1"
                        onClick={async () => {
                          if (!text.trim()) return;
                          await addComment({
                            uplineManagerLinkId: linkId,
                            itemType,
                            itemId,
                            authorType: "ajose",
                            authorName: currentUserName || "Ajose",
                            commentText: text.trim(),
                          });
                          setText("");
                          loadComments();
                        }}
                        disabled={!text.trim()}
                      >
                        <Send className="h-3 w-3" /> Send
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isAjose && comments.map((c) => (
            <div
              key={c.id}
              className={cn(
                "rounded-lg border p-3",
                c.authorType === "ajose"
                  ? "border-primary/30 bg-primary/5 ml-4"
                  : "border-border bg-card"
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
                <span>{new Date(c.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}</span>
              </div>
              <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.commentText}</p>
            </div>
          ))}

          {!isAjose && displayLinkId && (
            <div className="flex gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[60px] text-sm flex-1"
              />
              <Button
                size="sm"
                className="self-end gap-1"
                onClick={handleSubmit}
                disabled={!text.trim()}
              >
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
