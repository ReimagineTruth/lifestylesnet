import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  REVIEW_AVERAGE,
  formatPublicReviewCount,
  type CustomerReview,
  customerReviewsTagalog,
  formatReviewTimeAgo,
  reviewsForProduct,
} from "@/lib/customer-reviews-tagalog";

type Props = {
  /** Filter by catalog product display name, e.g. "Intra" */
  productName?: string;
  className?: string;
};

const VISIBLE_COUNT = 8;
const LIVE_INTERVAL_MS = 4500;

function Stars() {
  return (
    <span className="inline-flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
      ))}
    </span>
  );
}

function ReviewCard({
  review,
  isNew,
  liveOffsetMin,
}: {
  review: CustomerReview;
  isNew?: boolean;
  liveOffsetMin: number;
}) {
  return (
    <article
      className={`rounded-xl border bg-card p-5 transition-all duration-500 ${
        isNew
          ? "border-brand/40 bg-brand-soft/30 shadow-md ring-1 ring-brand/20"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{review.name}</p>
          <p className="text-sm text-muted-foreground">
            {review.location} · {review.product}
          </p>
        </div>
        <Stars />
      </div>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{review.text}</p>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        {isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 font-medium text-brand">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            Bago
          </span>
        )}
        <span>{formatReviewTimeAgo(review.minutesAgo, liveOffsetMin)}</span>
      </p>
    </article>
  );
}

export function LiveCustomerReviews({ productName, className = "" }: Props) {
  const pool = useMemo(
    () => (productName ? reviewsForProduct(productName) : customerReviewsTagalog),
    [productName],
  );

  const [cursor, setCursor] = useState(VISIBLE_COUNT);
  const [visible, setVisible] = useState<CustomerReview[]>(() => pool.slice(0, VISIBLE_COUNT));
  const [newId, setNewId] = useState<number | null>(null);
  const [liveOffsetMin, setLiveOffsetMin] = useState(0);
  const [recentCount, setRecentCount] = useState(1_247);

  useEffect(() => {
    if (pool.length === 0) return;

    const tick = () => {
      setCursor((prev) => {
        const nextReview = pool[prev % pool.length]!;
        setVisible((current) => [nextReview, ...current.slice(0, VISIBLE_COUNT - 1)]);
        setNewId(nextReview.id);
        setRecentCount((n) => n + 1);
        window.setTimeout(() => setNewId(null), 2800);
        return prev + 1;
      });
    };

    const interval = window.setInterval(tick, LIVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [pool]);

  useEffect(() => {
    const minuteTimer = window.setInterval(() => {
      setLiveOffsetMin((m) => m + 1);
    }, 60_000);
    return () => window.clearInterval(minuteTimer);
  }, []);

  const displayCount = formatPublicReviewCount();
  const average = REVIEW_AVERAGE;

  return (
    <section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Customer reviews</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Live
            </span>
          </div>
          <h2 className="mt-3">Mga review ng customers</h2>
          <p className="lead mt-4 max-w-xl">
            Tunay na feedback mula sa buyers sa buong Pilipinas — may bagong review tuwing ilang
            segundo.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-6 py-4 text-center">
          <p className="text-4xl font-semibold tabular-nums">{average.toFixed(1)}</p>
          <Stars />
          <p className="mt-2 text-sm text-muted-foreground">
            {displayCount} review
            {productName ? ` · ${productName}` : ""} · {recentCount.toLocaleString("en-PH")} bago
            ngayong araw
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {visible.map((review, index) => (
          <ReviewCard
            key={`${review.id}-${index}`}
            review={review}
            isNew={newId === review.id && index === 0}
            liveOffsetMin={liveOffsetMin}
          />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Patuloy na dumadating ang bagong feedback mula sa customers sa buong Pilipinas.
      </p>
    </section>
  );
}
