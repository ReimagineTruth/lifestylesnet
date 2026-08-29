import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getThreadId, type FeedbackMessage } from "@/lib/feedback";
import { getThreadMessagesFn, listAllFeedbackMessagesFn } from "@/lib/feedback.server";

export function useFeedbackThread() {
  const [threadId] = useState(getThreadId);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["feedback", threadId],
    queryFn: () => getThreadMessagesFn({ data: threadId }),
    refetchInterval: 3000,
  });

  useEffect(() => {
    const onFocus = () => void refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  return { threadId, messages, refetch };
}

export function useAllFeedback(token: string | null) {
  return useQuery({
    queryKey: ["feedback-all", token],
    queryFn: () => listAllFeedbackMessagesFn({ data: token! }),
    enabled: Boolean(token),
    refetchInterval: 3000,
  });
}

export type { FeedbackMessage };
