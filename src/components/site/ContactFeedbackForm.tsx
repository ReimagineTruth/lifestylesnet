import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { getThreadId } from "@/lib/feedback";
import { tl } from "@/lib/tagalog";
import { sendFeedbackMessageFn } from "@/lib/feedback.server";

export function ContactFeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    const threadId = getThreadId();
    const body = [message.trim(), email.trim() && `Email: ${email.trim()}`]
      .filter(Boolean)
      .join("\n");

    await sendFeedbackMessageFn({
      data: {
        threadId,
        text: body,
        from: "user",
        name: name || undefined,
        email: email || undefined,
      },
    });
    toast.success(tl.toast.feedbackSent);

    await new Promise((r) => setTimeout(r, 1200));
    await sendFeedbackMessageFn({
      data: { threadId, text: tl.feedback.autoReply, from: "support" },
    });

    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-medium">
          Pangalan
        </label>
        <input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tl.feedback.namePlaceholder}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tl.feedback.emailPlaceholder}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium">
          Mensahe
        </label>
        <textarea
          id="contact-message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={tl.feedback.placeholder}
          rows={4}
          className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || sending}
        className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {sending ? tl.feedback.sending : tl.feedback.send}
      </button>
    </form>
  );
}
