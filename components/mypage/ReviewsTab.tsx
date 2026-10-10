"use client";

import Link from "next/link";
import { useReviews } from "../ReviewsProvider";
import ReviewItem from "../ReviewItem";

export default function ReviewsTab() {
  const { allReviews } = useReviews();
  const mine = allReviews.filter((r) => r.mine);

  return (
    <section className="surface mypage-section">
      <h2>내가 쓴 리뷰</h2>
      {mine.length ? (
        <ol className="rv-list">
          {mine.map((r) => (
            <ReviewItem key={r.id} review={r} showMenu />
          ))}
        </ol>
      ) : (
        <div className="empty">
          아직 작성한 리뷰가 없어요.
          <Link className="ghost-btn" href="/menu">
            메뉴 보러 가기
          </Link>
        </div>
      )}
    </section>
  );
}
