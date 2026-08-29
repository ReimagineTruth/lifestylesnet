export type FeedbackSender = "user" | "support";

export type FeedbackMessage = {
  id: string;
  threadId: string;
  text: string;
  from: FeedbackSender;
  name?: string;
  createdAt: string;
};

const THREAD_KEY = "lifestyles-ph-feedback-thread";

export function getThreadId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(THREAD_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    window.localStorage.setItem(THREAD_KEY, id);
  }
  return id;
}
