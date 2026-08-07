import { useState } from "react";
import { Bell, Send, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer, NotificationRow } from "@/lib/people-schemas";

export type FeedItem = { id: string; title: string; body: string; at: string; tone: "info" | "alert" };

export function NotificationCenter({
  feed,
  history,
  customers,
  busy,
  permission,
  onEnable,
  onSend,
  onDelete,
}: {
  feed: FeedItem[];
  history: NotificationRow[];
  customers: Customer[];
  busy: boolean;
  permission: string;
  onEnable: () => void;
  onSend: (input: { audience: "all" | "one"; recipient_id?: string; title: string; body: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [audience, setAudience] = useState<"all" | "one">("all");
  const [recipient, setRecipient] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="size-4" />
          <span className="hidden sm:inline">Notifications</span>
          {feed.length > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {feed.length > 9 ? "9+" : feed.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notification centre</SheetTitle>
          <SheetDescription>Live events, plus messages you send to customers.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {permission !== "granted" && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
              <p className="font-semibold">Get desktop alerts</p>
              <p className="mt-1 text-muted-foreground">
                Allow browser notifications and new orders will pop up even when this tab is in the
                background.
              </p>
              <Button size="sm" className="mt-3" onClick={onEnable} disabled={permission === "denied"}>
                {permission === "denied" ? "Blocked in browser settings" : "Enable notifications"}
              </Button>
            </div>
          )}

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live activity
            </h4>
            <ul className="mt-2 space-y-2">
              {feed.map((f) => (
                <li key={f.id} className="rounded-xl border border-border p-3 text-sm">
                  <p className="flex items-center justify-between gap-2 font-semibold">
                    {f.title}
                    {f.tone === "alert" && (
                      <Badge className="bg-destructive/15 text-destructive">Alert</Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground">{f.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(f.at).toLocaleTimeString()}
                  </p>
                </li>
              ))}
              {feed.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Quiet right now. New orders show up here instantly.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Message customers
            </h4>
            <div className="mt-2 space-y-2">
              <Select value={audience} onValueChange={(v) => setAudience(v as "all" | "one")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="one">One customer</SelectItem>
                </SelectContent>
              </Select>
              {audience === "one" && (
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.slice(0, 200).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name || c.email || c.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                placeholder="Title"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                rows={3}
                placeholder="Message"
                value={body}
                maxLength={500}
                onChange={(e) => setBody(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={busy || !title.trim() || (audience === "one" && !recipient)}
                onClick={() => {
                  onSend({
                    audience,
                    ...(audience === "one" ? { recipient_id: recipient } : {}),
                    title: title.trim(),
                    body: body.trim(),
                  });
                  setTitle("");
                  setBody("");
                }}
              >
                <Send className="size-4" /> Send
              </Button>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sent history
            </h4>
            <ul className="mt-2 space-y-2">
              {history.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 rounded-xl border border-border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.audience === "all" ? "Everyone" : "One customer"} ·{" "}
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" disabled={busy} onClick={() => onDelete(n.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
              {history.length === 0 && (
                <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No messages sent yet.
                </li>
              )}
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}