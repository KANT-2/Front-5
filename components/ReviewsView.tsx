"use client";

import { useEffect, useRef, useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { useReviews } from "./ReviewsProvider";
import StarRating from "./StarRating";
import { useReducedMotion } from "@/lib/hooks";
import { SORTERS, SORT_LABELS, statsOf, type SortKey } from "@/lib/reviews";

const PAGE = 6;

export default function ReviewsView({ id, name }: { id: number; name: string }) {
  const all = useReviews().reviewsFor(id);
  const reduced = useReducedMotion();
  const [sort, setSort] = useState<SortKey>("new");
  const [shown, setShown] = useState(PAGE);
  // 별점 걸러 보기 (null = 전체)
  const [star, setStar] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sumRef = useRef<HTMLElement>(null);
  const focusFrom = useRef<number | null>(null);

  const s = statsOf(all);
  const list = all.filter((r) => star === null || r.stars === star).sort(SORTERS[sort]);
  const pickStar = (k: number | null) => {
    setStar((cur) => (cur === k ? null : k));
    setShown(PAGE);
  };
  const visible = list.slice(0, shown);

  // "리뷰 더보기" 뒤에는 새로 나타난 첫 카드의 제목으로 포커스를 옮긴다.
  useEffect(() => {
    const from = focusFrom.current;
    if (from === null) return;
    focusFrom.current = null;
    const h = listRef.current?.children[from]?.querySelector("h3");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus();
    }
  }, [shown]);

  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("write")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    history.replaceState(history.state, "", "#write");
    setTimeout(() => document.querySelector<HTMLInputElement>("#write input[name=stars]")?.focus({ preventScroll: true }), 400);
  };

  return (
    <>
      <div className="rv-layout">
        <aside className="rv-sum" ref={sumRef} aria-label="평점 요약">
          <span className="small-label">CUSTOMER RATING</span>
          <div className="rating-score">
            <strong>{s.avg.toFixed(1)}</strong>
            <span>/ 5</span>
          </div>
          <StarRating avg={s.avg} />
          <p>리뷰 {s.n}개 기준</p>
          <ul className="dist">
            {[5, 4, 3, 2, 1].map((k) => (
              <li key={k}>
                <button
                  type="button"
                  className="dist-row"
                  aria-pressed={star === k}
                  aria-label={`${k}점 리뷰 ${s.dist[k]}개만 보기`}
                  onClick={() => pickStar(k)}
                >
                  <span>{k}점</span>
                  <i>
                    <b style={{ width: `${s.n ? ((s.dist[k] / s.n) * 100).toFixed(1) : 0}%` }} />
                  </i>
                  <em>{s.dist[k]}</em>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="rv-main">
          <div className="rv-toolbar">
            <span aria-live="polite">
              {star === null ? `총 ${list.length}개` : `${star}점 리뷰 ${list.length}개`} · {visible.length}개 표시
            </span>
            <div className="rv-tools">
              <label className="rv-sort">
                <span className="sr-only">정렬</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey);
                    setShown(PAGE);
                  }}
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>
                      {SORT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <a className="rs-link" href="#write" onClick={scrollToForm}>
                리뷰 쓰기
              </a>
            </div>
          </div>
          <div className="rv-stars" role="group" aria-label="별점별 걸러 보기">
            <button type="button" aria-pressed={star === null} onClick={() => pickStar(null)}>
              전체 {s.n}
            </button>
            {[5, 4, 3, 2, 1].map((k) => (
              <button key={k} type="button" aria-pressed={star === k} onClick={() => pickStar(k)}>
                ★ {k}점 {s.dist[k]}
              </button>
            ))}
          </div>
          <div className="review-cards rv-list" ref={listRef}>
            {visible.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
          {list.length === 0 && (
            <p className="empty rv-empty">
              아직 {star}점 리뷰가 없어요.{" "}
              <button type="button" className="text-link" onClick={() => pickStar(null)}>
                전체 리뷰 보기
              </button>
            </p>
          )}
          {visible.length < list.length && (
            <div className="rv-more">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  focusFrom.current = visible.length;
                  setShown((n) => n + PAGE);
                }}
              >
                리뷰 더보기
              </button>
            </div>
          )}
        </div>
      </div>
      <ReviewForm
        id={id}
        name={name}
        onAdded={() => {
          setSort("new");
          setStar(null);
          setShown(PAGE);
          sumRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }}
      />
    </>
  );
}
