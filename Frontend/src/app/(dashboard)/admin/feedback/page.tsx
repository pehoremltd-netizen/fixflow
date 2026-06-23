"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getInboxForAjose,
  addComment,
  updateCommentStatus,
  markThreadAsRead,
  getNewCommentCount,
} from "@/lib/store/uplineManagerComments";
import {
  getFeedback,
  updateFeedbackStatus,
  updateFeedbackResponse,
  getNewFeedbackCount,
} from "@/lib/store/viewerFeedback";
import type { InboxGroup } from "@/lib/store/uplineManagerComments";
import type { ViewerFeedback, FeedbackStatus } from "@/types";
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  Reply,
  Send,
  Shield,
  User,
  Search,
  RefreshCw,
  MessageSquareText,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Read: "bg-muted-foreground/10 text-text-tertiary border-border/20",
  Actioned: "bg-success/10 text-success border-success/20",
};

export default function FeedbackPage() {
  const [inbox, setInbox] = useState<InboxGroup[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");

  const [feedback, setFeedback] = useState<ViewerFeedback[]>([]);
  const [feedbackNewCount, setFeedbackNewCount] = useState(0);
  const [expandedFb, setExpandedFb] = useState<string | null>(null);
  const [fbReplyText, setFbReplyText] = useState("");

  const refreshInbox = async () => {
    setInbox(await getInboxForAjose());
    setNewCount(await getNewCommentCount());
  };

  const refreshFeedback = async () => {
    setFeedback(await getFeedback());
    setFeedbackNewCount(await getNewFeedbackCount());
  };

  useEffect(() => { refreshInbox(); refreshFeedback(); }, []);

  const handleInboxReply = async (orderKey: string) => {
    if (!replyText.trim()) return;
    const thread = inbox.find((g) => g.orderKey === orderKey);
    if (!thread) return;
    const viewerLinkId = thread.comments[0]?.uplineManagerLinkId || "";
    await addComment({
      uplineManagerLinkId: viewerLinkId,
      itemType: thread.itemType,
      itemId: thread.itemId,
      authorType: "ajose",
      authorName: "Ajose",
      commentText: replyText.trim(),
    });
    setReplyText("");
    setExpandedThread(null);
    await refreshInbox();
  };

  const handleStatusCycle = async (id: string, current: FeedbackStatus) => {
    const next: Record<FeedbackStatus, FeedbackStatus> = {
      New: "Read",
      Read: "Actioned",
      Actioned: "New",
    };
    await updateCommentStatus(id, next[current]);
    await refreshInbox();
  };

  const handleFbStatusCycle = async (id: string, current: FeedbackStatus) => {
    const next: Record<FeedbackStatus, FeedbackStatus> = {
      New: "Read",
      Read: "Actioned",
      Actioned: "New",
    };
    await updateFeedbackStatus(id, next[current]);
    await refreshFeedback();
  };

  const handleFbReply = async (id: string) => {
    if (!fbReplyText.trim()) return;
    await updateFeedbackResponse(id, fbReplyText.trim());
    setFbReplyText("");
    setExpandedFb(null);
    await refreshFeedback();
  };

  const filteredInbox = inbox.filter(
    (g) =>
      g.viewerName.toLowerCase().includes(search.toLowerCase()) ||
      g.itemType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquareText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upline Manager Comments</h1>
          <p className="text-sm text-text-tertiary">
            View and reply to threaded comments from upline managers
          </p>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="inbox" className="text-xs gap-1.5 relative">
            <MessageSquare className="h-3.5 w-3.5" />
            Inbox
            {newCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full">
                {newCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="legacy" className="text-xs gap-1.5 relative">
            <Eye className="h-3.5 w-3.5" />
            Legacy Feedback
            {feedbackNewCount > 0 && (
              <span className="ml-1 bg-muted-foreground/20 text-text-tertiary text-[9px] px-1.5 py-0.5 rounded-full">
                {feedbackNewCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ INBOX TAB ═══════════ */}
        <TabsContent value="inbox" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by viewer name or item type..."
                className="pl-9 text-sm border-border bg-card text-foreground"
              />
            </div>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={refreshInbox}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {filteredInbox.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-10 text-center text-text-tertiary">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No comments yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredInbox.map((group, i) => (
                <motion.div
                  key={group.orderKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={cn(
                    "border-border bg-card",
                    group.newCount > 0 && "border-primary/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <User className="h-3.5 w-3.5 text-text-tertiary" />
                            <span className="text-sm font-semibold text-foreground">
                              {group.viewerName}
                            </span>
                            <Badge variant="outline" className="text-[9px]">
                              {group.itemType.replace(/_/g, " ")}
                            </Badge>
                            {group.newCount > 0 && (
                              <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">
                                {group.newCount} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-tertiary mt-1">
                            {group.comments.length} comment{group.comments.length !== 1 ? "s" : ""} · Last activity{" "}
                            {new Date(group.lastActivity).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>

                          <div className="mt-2 rounded bg-card-alt p-2 border border-border">
                            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                              {group.comments[0].authorType === "ajose" ? (
                                <Shield className="h-3 w-3 text-primary" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              <span className="font-medium text-foreground">{group.comments[0].authorName}</span>
                            </div>
                            <p className="text-sm text-foreground mt-0.5 line-clamp-2">
                              {group.comments[0].commentText}
                            </p>
                          </div>

                          {expandedThread === group.orderKey && (
                            <div className="mt-3 space-y-2">
                              {group.comments.map((c) => (
                                <div
                                  key={c.id}
                                  className={cn(
                                    "rounded border p-2",
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
                                    <Badge className={cn("text-[9px]", STATUS_STYLES[c.status])}>
                                      {c.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.commentText}</p>
                                </div>
                              ))}

                              <div className="flex gap-2 pt-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Reply as Ajose..."
                                  className="flex-1 min-h-[50px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none"
                                />
                                <Button
                                  size="sm"
                                  className="self-end gap-1"
                                  onClick={() => handleInboxReply(group.orderKey)}
                                  disabled={!replyText.trim()}
                                >
                                  <Send className="h-3 w-3" /> Send
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => {
                            setExpandedThread(expandedThread === group.orderKey ? null : group.orderKey);
                            setReplyText("");
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {expandedThread === group.orderKey ? "Collapse" : "View Thread"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => {
                            if (group.comments.length > 0) {
                              handleStatusCycle(group.comments[0].id, group.comments[0].status);
                            }
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════════ LEGACY FEEDBACK TAB ═══════════ */}
        <TabsContent value="legacy" className="space-y-4">
          {feedback.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-10 text-center text-text-tertiary">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No legacy feedback data</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {feedback.map((fb, i) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={cn("border-border bg-card", fb.status === "New" && "border-primary/30")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{fb.viewerName}</span>
                            <Badge variant="outline" className="text-[10px]">{fb.pageLabel}</Badge>
                            <Badge className={cn("text-[10px]", STATUS_STYLES[fb.status])}>{fb.status}</Badge>
                          </div>
                          <p className="text-xs text-text-tertiary mt-1">
                            {new Date(fb.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{fb.commentText}</p>
                          {fb.ajoseResponse && (
                            <div className="mt-3 pl-3 border-l-2 border-primary/40">
                              <p className="text-xs text-text-tertiary font-medium">Your reply:</p>
                              <p className="text-sm text-foreground mt-0.5">{fb.ajoseResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => handleFbStatusCycle(fb.id, fb.status)}>
                          {fb.status === "New" ? <Eye className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Mark as {fb.status === "New" ? "Read" : fb.status === "Read" ? "Actioned" : "New"}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => { setExpandedFb(expandedFb === fb.id ? null : fb.id); setFbReplyText(fb.ajoseResponse || ""); }}>
                          <Reply className="h-3.5 w-3.5" /> Reply
                        </Button>
                      </div>
                      {expandedFb === fb.id && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <textarea value={fbReplyText} onChange={(e) => setFbReplyText(e.target.value)}
                            placeholder="Write a reply..." className="w-full min-h-[60px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setExpandedFb(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleFbReply(fb.id)}>Save Reply</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
