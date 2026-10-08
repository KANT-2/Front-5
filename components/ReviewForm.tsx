"use client";

import { useEffect, useRef, useState } from "react";
import { useReviews } from "./ReviewsProvider";
import { useToast } from "./ToastProvider";
import { RATE_LABELS, dateStr } from "@/lib/reviews";

const len = (s: string) => [...s].length;

interface Props {
  id: number;
  name: string;
  onAdded: () => void;
}

export default function ReviewForm({ id, name, onAdded }: Props) {
  const { addReview } = useReviews();
  const toast = useToast();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [nick, setNick] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const section = useRef<HTMLElement>(null);
  const firstStar = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // #write 로 들어오면 작성 폼으로 스크롤하고 별점 입력에 포커스
  useEffect(() => {
    if (location.hash !== "#write") return;
    const t = setTimeout(() => {
      section.current?.scrollIntoView();
      firstStar.current?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tTitle = title.trim();
    const tText = text.trim();
    const tNick = nick.trim();
    if (!stars) {
      setMsg("별점을 선택해주세요.");
      return;
    }
    if (len(tTitle) < 2) {
      setMsg("제목을 2자 이상 입력해주세요.");
      titleRef.current?.focus();
      return;
    }
    if (len(tText) < 10) {
      setMsg("내용을 10자 이상 입력해주세요.");
      textRef.current?.focus();
      return;
    }
    const now = Date.now();
    addReview({
      id: "u" + now,
      pid: id,
      author: tNick ? [...tNick][0] + "**" : "익명",
      stars,
      title: tTitle,
      text: tText,
      date: dateStr(now),
      via: "delivery",
      t: now,
      sample: false,
      mine: true,
    });
    setMsg("");
    setStars(0);
    setHover(0);
    setNick("");
    setTitle("");
    setText("");
    toast("리뷰가 등록되었어요");
    onAdded();
  };

  const painted = hover || stars;

  return (
    <section className="rv-write" id="write" ref={section} aria-labelledby="wTitle">
      <div>
        <span className="eyebrow">WRITE A REVIEW</span>
        <h2 id="wTitle">{name}, 어떠셨나요?</h2>
        <p>별점과 짧은 한마디면 충분해요. 닉네임은 첫 글자만 보이고 나머지는 **로 가려져요.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <fieldset className="rate">
          <legend>별점</legend>
          <div className="rate-row" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className={n <= painted ? "on" : ""} onMouseEnter={() => setHover(n)}>
                <input ref={n === 1 ? firstStar : undefined} type="radio" name="stars" value={n} checked={stars === n} onChange={() => setStars(n)} />
                <span aria-hidden="true">★</span>
                <span className="sr-only">{n}점</span>
              </label>
            ))}
          </div>
          <em>{stars ? RATE_LABELS[stars] : "선택해주세요"}</em>
        </fieldset>
        <label className="field">
          <span>닉네임</span>
          <input name="nick" maxLength={10} placeholder="예: 샐러드러버" autoComplete="nickname" value={nick} onChange={(e) => setNick(e.target.value)} />
        </label>
        <label className="field">
          <span>제목</span>
          <input ref={titleRef} name="title" maxLength={30} placeholder="한 줄로 요약해주세요 (2~30자)" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>
            내용 <small>{len(text)} / 300</small>
          </span>
          <textarea
            ref={textRef}
            name="text"
            rows={4}
            maxLength={300}
            placeholder="맛, 양, 드레싱 조합 등 어떤 점이 좋았나요? (10자 이상)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <p className="rv-msg" role="alert">
          {msg}
        </p>
        <button className="primary" type="submit">
          리뷰 등록하기 <span>↗</span>
        </button>
      </form>
    </section>
  );
}
