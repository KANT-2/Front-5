"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** 다음 배너로 넘어가기까지의 시간 (밀리초) */
export const HERO_MS = 6000;

interface Slide {
  eyebrow: string;
  title: [string, string];
  body: [string, string];
  cta: string;
  href: string;
  src: string;
  alt: string;
  noteEn: string;
  noteKo: string;
  sticker: [string, string];
  /** 사진 속 그릇 테두리 (이미지 너비 대비 %, 중심과 가로·세로 반지름) */
  bowl: [cx: number, cy: number, rx: number, ry: number];
}

const SLIDES: Slide[] = [
  {
    eyebrow: "FRESH BOWL, FRESH DAY",
    title: ["좋은 하루는,", "좋은 한 그릇에서."],
    body: [
      "신선한 재료와 기분 좋은 조합.",
      "오늘의 나를 위한 샐러드를 만나보세요.",
    ],
    cta: "오늘의 샐러드 고르기",
    href: "/#menu",
    src: "/images/hero-cutout.png",
    alt: "레몬과 아보카도를 곁들인 구운 치킨 샐러드",
    noteEn: "LEMON CHICKEN BOWL",
    noteKo: "레몬 치킨 아보카도",
    sticker: ["fresh", "feels good."],
    bowl: [50, 50.5, 44.4, 39],
  },
  {
    eyebrow: "PROTEIN BOWL, STRONG DAY",
    title: ["든든한 한 끼도,", "가볍게 한 그릇."],
    body: [
      "부드럽게 구운 연어와 잘 익은 아보카도.",
      "단백질 29g으로 오후까지 든든하게.",
    ],
    cta: "연어 아보카도 보기",
    href: "/product/1",
    src: "/images/salad-01-cutout.png",
    alt: "구운 연어와 아보카도, 오이를 담은 샐러드",
    noteEn: "SALMON AVOCADO BOWL",
    noteKo: "연어 아보카도",
    sticker: ["strong", "stays light."],
    bowl: [50, 50, 43.7, 43.7],
  },
  {
    eyebrow: "PLANT BOWL, GREEN DAY",
    title: ["초록으로 채운,", "가벼운 하루."],
    body: [
      "고소한 구운 두부와 알알이 퀴노아.",
      "식물성 재료만으로도 충분히 맛있게.",
    ],
    cta: "두부 퀴노아 보기",
    href: "/product/3",
    src: "/images/salad-03-cutout.png",
    alt: "구운 두부와 퀴노아, 에다마메를 담은 샐러드",
    noteEn: "TOFU QUINOA BOWL",
    noteKo: "두부 퀴노아",
    sticker: ["green", "tastes good."],
    bowl: [50, 49.5, 41.7, 41.7],
  },
];

const TOTAL = SLIDES.length;
const two = (n: number) => String(n).padStart(2, "0");

// 그릇 테두리에서 글씨까지의 간격과, 글씨가 지나가는 구간 (수학 각도: 왼쪽 조금 아래 → 위쪽 가운데)
const RING_GAP = 4;
const ARC_FROM = 192;
const ARC_TO = 92;

/** 그릇 왼쪽 위를 따라 도는 호 (시계 방향) */
function arcPath([cx, cy, rx, ry]: Slide["bowl"]) {
  const a = rx + RING_GAP;
  const b = ry + RING_GAP;
  const pt = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return `${(cx + a * Math.cos(r)).toFixed(2)} ${(cy - b * Math.sin(r)).toFixed(2)}`;
  };
  return `M ${pt(ARC_FROM)} A ${a} ${b} 0 0 1 ${pt(ARC_TO)}`;
}

/**
 * 홈 상단 히어로 배너. 여러 장을 겹쳐 두고 HERO_MS 마다 페이드로 넘긴다.
 * 마우스를 올리거나 키보드 포커스가 있거나, 화면 밖·탭 숨김·정지 버튼·동작 줄이기 설정이면 멈춘다.
 */
export default function HeroCarousel() {
  const reduced = useReducedMotion();
  // 첫 렌더는 서버와 같게 항상 첫 번째 배너
  const [index, setIndex] = useState(0);
  // 같은 번호를 다시 눌러도 진행 시간을 0으로 되돌리기 위한 카운터
  const [cycle, setCycle] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageHidden, setPageHidden] = useState(false);
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (en) => setVisible(en[0].isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const paused = hover || focus || stopped || reduced || !visible || pageHidden;

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % TOTAL), HERO_MS);
    return () => clearTimeout(t);
  }, [paused, index, cycle]);

  const go = (n: number) => {
    setIndex((n + TOTAL) % TOTAL);
    setCycle((c) => c + 1);
  };

  return (
    <section
      ref={box}
      className="hero"
      aria-roledescription="carousel"
      aria-label="추천 샐러드"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocus(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
    >
      <div className="hero-slides">
        {SLIDES.map((s, i) => {
          const active = i === index;
          const Title = active ? "h1" : "p";
          return (
            <div
              key={s.src}
              className={`hero-inner wrap${active ? " is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${TOTAL}개 중 ${i + 1}번째`}
              aria-hidden={!active}
              inert={!active}
            >
              <div className="hero-copy">
                <div className="eyebrow">{s.eyebrow}</div>
                <Title className="hero-title">
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </Title>
                <p>
                  {s.body[0]}
                  <br />
                  {s.body[1]}
                </p>
                <Link className="primary" href={s.href}>
                  {s.cta} <span>↗</span>
                </Link>
              </div>
              <div className="hero-photo">
                <div className="hero-bowl">
                  <Image
                    src={s.src}
                    width={1024}
                    height={1024}
                    sizes="(max-width: 600px) 90vw, 57vw"
                    preload={i === 0}
                    loading="eager"
                    alt={s.alt}
                  />
                  <svg
                    className="hero-ring"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <path
                      id={`hero-ring-${i}`}
                      d={arcPath(s.bowl)}
                      fill="none"
                    />
                    <text>
                      <textPath href={`#hero-ring-${i}`}>
                        {s.noteEn} · {s.noteKo}
                      </textPath>
                    </text>
                  </svg>
                  <span className="sr-only">
                    {s.noteEn} {s.noteKo}
                  </span>
                </div>
                <div className="hero-sticker" aria-hidden="true">
                  {s.sticker[0]}
                  <br />
                  <i>{s.sticker[1]}</i>
                  <span>LEAF &amp; BOWL</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-bottom wrap">
        <span>MAKE EVERY DAY A FRESH DAY</span>
        <div className="hero-ctrl">
          <span
            className="hero-count"
            aria-live={paused ? "polite" : "off"}
            aria-atomic="true"
          >
            <span className="sr-only">현재 배너 </span>
            {two(index + 1)}
          </span>
          <div className="hero-dots" role="group" aria-label="배너 선택">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                className={i === index ? "is-active" : ""}
                aria-label={`${i + 1}번째 배너: ${s.noteKo}`}
                aria-current={i === index}
                onClick={() => go(i)}
              >
                <span
                  key={i === index ? `on-${cycle}` : "off"}
                  className={`hero-bar${i === index && !paused ? " is-running" : ""}`}
                  style={{ animationDuration: `${HERO_MS}ms` }}
                />
              </button>
            ))}
          </div>
          <span className="hero-total">{two(TOTAL)}</span>
          {!reduced && (
            <button
              type="button"
              className="hero-pause"
              aria-label={
                stopped ? "배너 자동 넘김 재생" : "배너 자동 넘김 정지"
              }
              onClick={() => setStopped((v) => !v)}
            >
              <span aria-hidden="true">{stopped ? "▶" : "❚❚"}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
