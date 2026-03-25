"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, lightProductCompactGhostButtonClass, lightProductPanelClass } from "../components/stackaura-ui";

type NotificationItem = {
  id: string;
  kind: "failed_payment" | "recovered_payment" | "support_escalation" | "gateway_issue";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

function storageKeyFor(userEmail: string) {
  return `stackaura_dashboard_notifications_read:${userEmail.toLowerCase()}`;
}

function kindBadge(kind: NotificationItem["kind"]) {
  if (kind === "failed_payment") return "Failed";
  if (kind === "recovered_payment") return "Recovered";
  if (kind === "support_escalation") return "Support";
  return "Gateway";
}

export default function DashboardNotifications({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKeyFor(userEmail));
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setReadIds(parsed);
      }
    } catch {
      setReadIds([]);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/notifications", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }

        const payload = (await res.json()) as { items?: NotificationItem[] };
        if (!cancelled) {
          setItems(Array.isArray(payload.items) ? payload.items : []);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function persistRead(nextIds: string[]) {
    setReadIds(nextIds);
    window.localStorage.setItem(storageKeyFor(userEmail), JSON.stringify(nextIds));
  }

  function markAsRead(id: string) {
    if (readIds.includes(id)) return;
    persistRead([...readIds, id]);
  }

  function markAllAsRead() {
    persistRead(items.map((item) => item.id));
  }

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.includes(item.id)).length,
    [items, readIds],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(lightProductCompactGhostButtonClass, "relative h-11 w-11 rounded-2xl px-0")}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
          <path d="M10 4.25C8.2 4.25 6.75 5.7 6.75 7.5V9.1C6.75 9.7 6.55 10.28 6.18 10.75L5.25 11.95C4.72 12.65 5.22 13.65 6.1 13.65H13.9C14.78 13.65 15.28 12.65 14.75 11.95L13.82 10.75C13.45 10.28 13.25 9.7 13.25 9.1V7.5C13.25 5.7 11.8 4.25 10 4.25Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.3 15.2C8.63 15.9 9.26 16.25 10 16.25C10.74 16.25 11.37 15.9 11.7 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#635bff] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={cn(lightProductPanelClass, "absolute right-0 top-[calc(100%+12px)] z-30 w-[360px] p-2")}>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Notifications</div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#635bff] transition hover:text-[#0a2540]"
              >
                Mark all as read
              </button>
            ) : null}
          </div>

          <div className="grid gap-1">
            {loading ? (
              <div className="rounded-2xl px-3 py-4 text-sm text-[#6b7c93]">Loading notifications…</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl px-3 py-4 text-sm text-[#6b7c93]">
                No operational notifications right now.
              </div>
            ) : (
              items.map((item) => {
                const unread = !readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-2xl border px-3 py-3 transition",
                      unread ? "border-white/52 bg-white/28" : "border-transparent bg-white/12",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        markAsRead(item.id);
                        setOpen(false);
                        router.push(item.href);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#0a2540]">{item.title}</div>
                          <div className="mt-1 text-xs leading-5 text-[#6b7c93]">{item.description}</div>
                        </div>
                        <span className="rounded-full border border-white/42 bg-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7c93]">
                          {kindBadge(item.kind)}
                        </span>
                      </div>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-[#6b7c93]">
                        {new Intl.DateTimeFormat("en-ZA", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(item.createdAt))}
                      </div>
                      {unread ? (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className="text-[11px] font-medium text-[#635bff] transition hover:text-[#0a2540]"
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
