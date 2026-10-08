"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { allReviewsOf, reviewsOf, statsOf, type Review, type ReviewStats } from "@/lib/reviews";
import { REVIEW_KEY, loadUserReviews, saveUserReviews } from "@/lib/storage";

const EMPTY: Review[] = [];
const store = createLocalStore<Review[]>(REVIEW_KEY, loadUserReviews, saveUserReviews, EMPTY);

interface ReviewsContextValue {
  userReviews: Review[];
  /** 모든 메뉴의 리뷰 */
  allReviews: Review[];
  reviewsFor: (pid: number) => Review[];
  statsFor: (pid: number) => ReviewStats;
  addReview: (review: Review) => void;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function useReviews(): ReviewsContextValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside <ReviewsProvider>");
  return ctx;
}

export default function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const userReviews = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const allReviews = useMemo(() => allReviewsOf(userReviews), [userReviews]);
  const reviewsFor = useCallback((pid: number) => reviewsOf(pid, userReviews), [userReviews]);
  const statsFor = useCallback((pid: number) => statsOf(reviewsOf(pid, userReviews)), [userReviews]);
  const addReview = useCallback((review: Review) => store.set([review, ...store.getSnapshot()]), []);

  const value = useMemo(
    () => ({ userReviews, allReviews, reviewsFor, statsFor, addReview }),
    [userReviews, allReviews, reviewsFor, statsFor, addReview],
  );
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}
