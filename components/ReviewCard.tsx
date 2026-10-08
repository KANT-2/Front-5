import { PRODUCTS } from "@/lib/products";
import { dateStr, type Review } from "@/lib/reviews";

export default function ReviewCard({ review: r }: { review: Review }) {
  return (
    <article className={`review-card${r.mine ? " is-mine" : ""}`}>
      <div className="review-top">
        <span className="review-stars" role="img" aria-label={`별점 5점 만점에 ${r.stars}점`}>
          {"★".repeat(r.stars)}
          {r.stars < 5 && (
            <span className="empty-star" aria-hidden="true">
              {"★".repeat(5 - r.stars)}
            </span>
          )}
        </span>
        <span>{r.stars}.0</span>
      </div>
      <h3>{r.title}</h3>
      <p>{r.text}</p>
      <span className="review-menu">
        {PRODUCTS[r.pid].name}
      </span>
      <div className="review-author">
        <span className="review-avatar" aria-hidden="true">
          {[...r.author][0] || "익"}
        </span>
        <span>
          {r.author}
          <small>
            {r.date || dateStr(r.t)} · {r.mine ? "내가 작성" : "예시 리뷰"}
          </small>
        </span>
      </div>
    </article>
  );
}
