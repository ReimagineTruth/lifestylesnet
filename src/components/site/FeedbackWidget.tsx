import { useEffect, useRef, useState } from "react";

import { MessageCircle, Send } from "lucide-react";

import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { tl } from "@/lib/tagalog";

import { useFeedbackThread } from "@/hooks/use-feedback";

import { sendFeedbackMessageFn } from "@/lib/feedback.server";

import { cn } from "@/lib/utils";

export function FeedbackWidget() {
  const { threadId, messages, refetch } = useFeedbackThread();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [text, setText] = useState("");

  const [sending, setSending] = useState(false);

  const [typing, setTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const submit = async () => {
    const trimmed = text.trim();

    if (!trimmed || sending) return;

    setSending(true);

    await sendFeedbackMessageFn({
      data: { threadId, text: trimmed, from: "user", name: name || undefined },
    });

    setText("");

    toast.success(tl.toast.feedbackSent);

    await refetch();

    setTyping(true);

    await new Promise((r) => setTimeout(r, 1400));

    await sendFeedbackMessageFn({
      data: { threadId, text: tl.feedback.autoReply, from: "support" },
    });

    setTyping(false);

    setSending(false);

    await refetch();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"

          aria-label={tl.feedback.button}

          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition-transform hover:scale-[1.02] hover:opacity-95"
        >
          <MessageCircle className="h-5 w-5" />

          <span className="hidden sm:inline">{tl.feedback.button}</span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{tl.feedback.title}</SheetTitle>

          <SheetDescription>{tl.feedback.subtitle}</SheetDescription>

          <p className="flex items-center gap-2 text-xs text-brand">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />

            {tl.feedback.online}
          </p>
        </SheetHeader>

        <div
          ref={scrollRef}

          className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4"
        >
          {messages.length === 0 && !typing && (
            <p className="text-center text-sm text-muted-foreground">{tl.feedback.empty}</p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}

              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",

                msg.from === "user"
                  ? "ml-auto bg-brand text-brand-foreground"
                  : "mr-auto bg-card text-foreground shadow-sm",
              )}
            >
              {msg.from === "user" && msg.name && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                  {msg.name}
                </p>
              )}

              <p className="leading-relaxed">{msg.text}</p>

              <p
                className={cn(
                  "mt-1 text-[10px]",

                  msg.from === "user" ? "text-brand-foreground/70" : "text-muted-foreground",
                )}
              >
                {new Date(msg.createdAt).toLocaleTimeString("fil-PH", {
                  hour: "numeric",

                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}

          {typing && (
            <div className="mr-auto rounded-2xl bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
              {tl.feedback.typing}
            </div>
          )}
        </div>

        <form
          className="mt-4 space-y-2"

          onSubmit={(e) => {
            e.preventDefault();

            void submit();
          }}
        >
          <input
            value={name}

            onChange={(e) => setName(e.target.value)}

            placeholder={tl.feedback.namePlaceholder}

            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          <div className="flex gap-2">
            <textarea
              value={text}

              onChange={(e) => setText(e.target.value)}

              placeholder={tl.feedback.placeholder}

              rows={2}

              className="min-h-11 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            <button
              type="submit"

              disabled={!text.trim() || sending}

              className="inline-flex shrink-0 items-center justify-center rounded-md bg-brand px-3 text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"

              aria-label={tl.feedback.send}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
