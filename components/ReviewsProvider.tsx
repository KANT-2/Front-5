"use client";

import { useCustomerCatalog, notifyCatalogSaved } from "./CustomerCatalogProvider";
import { createContext, useCallback, useContext, useMemo, useEffect, useRef, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { statsOf, type Review, type ReviewStats } from "@/lib/reviews";
import { REVIEW_KEY, loadUserReviews, saveUserReviews } from "@/lib/storage";

const EMPTY: Review[] = [];
const store = createLocalStore<Review[]>(REVIEW_KEY, loadUserReviews, saveUserReviews, EMPTY);

interface ReviewsContextValue {
  userReviews: Review[];
  /** 모든 메뉴의 리뷰 */
  allReviews: Review[];
  reviewsFor: (pid: number) => Review[];
  statsFor: (pid: number) => ReviewStats;
  addReview: (review: Review) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function useReviews(): ReviewsContextValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside <ReviewsProvider>");
  return ctx;
}

export default function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const {reviews}=useCustomerCatalog();
  const userReviews = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);


  const migrated=useRef(new Set<string>());
  useEffect(()=>{
    let cancelled=false;
    async function migrateLocalReviews(){
      for(const review of userReviews){
        if(cancelled)return;
        if(reviews.some(r=>r.id===review.id)||migrated.current.has(review.id))continue;
        migrated.current.add(review.id);
        try{const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(review)});if(response.ok)notifyCatalogSaved();}catch{}
      }
    }
    void migrateLocalReviews();
    return ()=>{cancelled=true;};
  },[userReviews,reviews]);

  const allReviews = useMemo(() => reviews.map(r => ({...r, mine: userReviews.some(u => u.id === r.id)})), [reviews, userReviews]);
  const reviewsFor = useCallback((pid: number) => [...reviews.filter(r=>r.pid===pid).map(r=>({...r,mine:userReviews.some(u=>u.id===r.id)}))], [userReviews,reviews]);
  const statsFor = useCallback((pid: number) => statsOf([...reviews.filter(r=>r.pid===pid).map(r=>({...r,mine:userReviews.some(u=>u.id===r.id)}))]), [userReviews,reviews]);
  const addReview = useCallback(async (review: Review) => {
    const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(review)});
    if(!response.ok)throw Error('리뷰를 저장하지 못했습니다. 다시 시도해주세요.');
    store.set([review,...store.getSnapshot()]);notifyCatalogSaved();
  }, []);


  const value = useMemo(
    () => ({ userReviews, allReviews, reviewsFor, statsFor, addReview }),
    [userReviews, allReviews, reviewsFor, statsFor, addReview],
  );
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}
