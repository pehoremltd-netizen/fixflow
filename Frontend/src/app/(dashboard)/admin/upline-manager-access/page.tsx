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
  createUplineManagerLink,
  getUplineManagerLinks,
  revokeUplineManagerLink,
  getLinkUrl,
} from "@/lib/store/uplineManagerLinks";
import {
  getFeedback,
  updateFeedbackStatus,
  updateFeedbackResponse,
  getNewFeedbackCount,
} from "@/lib/store/viewerFeedback";
import type { UplineManagerLink, ViewerFeedback, FeedbackStatus } from "@/types";
import {
  Link2,
  Copy,
  Check,
  RefreshCw,
  Users,
  MessageSquare,
  Eye,
  CheckCircle2,
  Reply,
  Trash2,
  ExternalLink,
  XCircle,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-primary/10 text-primary border-primary/20",
  Read: "bg-muted-foreground/10 text-text-tertiary border-border/20",
  Actioned: "bg-success/10 text-success border-success/20",
};

export default function UplineManagerAccessPage() {
  const [links, setLinks] = useState<UplineManagerLink[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [feedback, setFeedback] = useState<ViewerFeedback[]>([]);
  const [feedbackNewCount, setFeedbackNewCount] = useState(0);
  const [expandedFb, setExpandedFb] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const refreshLinks = async () => setLinks(await getUplineManagerLinks());
  const refreshFeedback = async () => {
    setFeedback(await getFeedback());
    setFeedbackNewCount(await getNewFeedbackCount());
  };

  useEffect(() => { refreshLinks(); refreshFeedback(); }, []);

  const handleGenerate = async () => {
    const name = nameInput.trim();
    if (!name) return;
    const link = await createUplineManagerLink(name);
    setGeneratedUrl(getLinkUrl(link.token));
    setNameInput("");
    await refreshLinks();
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRevoke = async (id: string) => {
    if (confirm("Revoke this link? The person will lose access immediately.")) {
      await revokeUplineManagerLink(id);
      await refreshLinks();
    }
  };

  const handleStatusCycle = async (id: string, current: FeedbackStatus) => {
    const next: Record<FeedbackStatus, FeedbackStatus> = {
      New: "Read",
      Read: "Actioned",
      Actioned: "New",
    };
    await updateFeedbackStatus(id, next[current]);
    await refreshFeedback();
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    await updateFeedbackResponse(id, replyText.trim());
    setReplyText("");
    setExpandedFb(null);
    await refreshFeedback();
  };

  const feedbackFiltered = feedback.filter((f) => f.uplineManagerLinkId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upline Manager Access</h1>
          <p className="text-sm text-text-tertiary">
            Generate no-login links for upline managers to access the portal
          </p>
        </div>
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="links" className="text-xs gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            Access Links
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs gap-1.5 relative">
            <MessageSquare className="h-3.5 w-3.5" />
            Feedback
            {feedbackNewCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full">
                {feedbackNewCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ LINKS TAB ═══════════ */}
        <TabsContent value="links" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Generate New Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter upline manager name (e.g. Mary, Faith)..."
                  className="flex-1 text-sm border-border bg-card text-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <Button onClick={handleGenerate} disabled={!nameInput.trim()} className="gap-1.5">
                  <Link2 className="h-4 w-4" /> Generate Link
                </Button>
              </div>

              {generatedUrl && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 space-y-2">
                  <p className="text-xs text-success font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Link generated! Share this with the upline manager:
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 rounded text-xs bg-background border border-border text-foreground break-all select-all">
                      {generatedUrl}
                    </code>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1" onClick={handleCopy}>
                      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Generated Links
                <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0 text-text-subtle" onClick={refreshLinks}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {links.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No links generated yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Created</th>
                        <th className="text-left py-3 px-4 font-medium">Last Accessed</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link, i) => (
                        <motion.tr
                          key={link.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-card-alt hover:bg-card-alt transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-foreground">{link.viewerName}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-text-tertiary">
                            {new Date(link.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4 text-xs text-text-tertiary">
                            {link.lastAccessedAt
                              ? new Date(link.lastAccessedAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={cn(
                              "text-[10px]",
                              link.status === "active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                              {link.status === "active" ? "Active" : "Revoked"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {link.status === "active" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-text-subtle hover:text-primary"
                                    onClick={() => {
                                      setGeneratedUrl(getLinkUrl(link.token));
                                    }}
                                    title="Show link"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-text-subtle hover:text-destructive"
                                    onClick={() => handleRevoke(link.id)}
                                    title="Revoke"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ FEEDBACK TAB ═══════════ */}
        <TabsContent value="feedback" className="space-y-4">
          {feedbackFiltered.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-10 text-center text-text-tertiary">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No feedback from upline managers yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {feedbackFiltered.map((fb, i) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={cn(
                    "border-border bg-card",
                    fb.status === "New" && "border-primary/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              {fb.viewerName}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {fb.pageLabel}
                            </Badge>
                            <Badge className={cn("text-[10px]", STATUS_STYLES[fb.status])}>
                              {fb.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-tertiary mt-1">
                            {new Date(fb.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
                            {fb.commentText}
                          </p>
                          {fb.ajoseResponse && (
                            <div className="mt-3 pl-3 border-l-2 border-primary/40">
                              <p className="text-xs text-text-tertiary font-medium">Your reply:</p>
                              <p className="text-sm text-foreground mt-0.5">{fb.ajoseResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => handleStatusCycle(fb.id, fb.status)}
                        >
                          {fb.status === "New" ? <Eye className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Mark as {fb.status === "New" ? "Read" : fb.status === "Read" ? "Actioned" : "New"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1 text-text-tertiary hover:text-foreground"
                          onClick={() => {
                            setExpandedFb(expandedFb === fb.id ? null : fb.id);
                            setReplyText(fb.ajoseResponse || "");
                          }}
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </Button>
                      </div>

                      {expandedFb === fb.id && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a short reply..."
                            className="w-full min-h-[60px] text-sm p-2 rounded border border-border bg-card text-foreground resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setExpandedFb(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleReply(fb.id)}>Save Reply</Button>
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
