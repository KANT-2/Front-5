import Image from "next/image";
import Link from "next/link";
import FoodImage from "@/components/FoodImage";
import MatchFloat from "@/components/MatchFloat";
import MenuSection from "@/components/MenuSection";
import ProductCard from "@/components/ProductCard";
import ReviewRotator from "@/components/ReviewRotator";
import { MATCH_URL, PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner wrap">
          <div className="hero-copy">
            <div className="eyebrow">FRESH BOWL, FRESH DAY</div>
            <h1>
              좋은 하루는,
              <br />
              좋은 한 그릇에서.
            </h1>
            <p>
              신선한 재료와 기분 좋은 조합.
              <br />
              오늘의 나를 위한 샐러드를 만나보세요.
            </p>
            <Link className="primary" href="/#menu">
              오늘의 샐러드 고르기 <span>↗</span>
            </Link>
            <div className="hero-note">
              LEMON CHICKEN BOWL <span>레몬 치킨 아보카도</span>
            </div>
          </div>
          <div className="hero-photo">
            <Image
              src="/images/hero-cutout.png"
              width={1024}
              height={1024}
              sizes="(max-width: 600px) 90vw, 57vw"
              preload
              loading="eager"
              alt="레몬과 아보카도를 곁들인 구운 치킨 샐러드"
            />
            <div className="hero-sticker">
              fresh
              <br />
              <i>feels good.</i>
              <span>LEAF &amp; BOWL</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom wrap">
          <span>MAKE EVERY DAY A FRESH DAY</span>
          <span>
            01 <span className="line" /> 03
          </span>
        </div>
      </section>

      <section className="section wrap" id="best">
        <div className="section-title">
          <div>
            <div className="eyebrow">YOUR NEXT FAVORITE</div>
            <h2>
              Best bowls<span>자꾸 생각나는 한 그릇</span>
            </h2>
          </div>
          <Link href="/#menu">전체 메뉴 보기 ↗</Link>
        </div>
        <div className="product-grid">
          {PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="monthly wrap" id="monthly">
        <div className="monthly-copy">
          <span className="pill">THIS MONTH’S PICK</span>
          <h2>
            조금 새로운 조합,
            <br />
            꽤 괜찮은 발견.
          </h2>
          <p>
            크리미한 부라타와 산뜻한 토마토.
            <br />
            이달엔 가볍게, 지중해로 떠나볼까요?
          </p>
          <Link className="text-link" href="/product/9">
            부라타 가든 만나보기 ↗
          </Link>
        </div>
        <div className="monthly-food">
          <FoodImage id={9} sizes="(max-width: 600px) 280px, 40vw" />
        </div>
        <div className="monthly-caption">
          <span>NEW COMBINATION</span>
          <strong>
            Burrata
            <br />
            garden.
          </strong>
          <span>산뜻함 위에, 부드러움 한 스푼.</span>
        </div>
      </section>

      <MenuSection />

      <section className="section reviews wrap" id="reviews" aria-labelledby="reviewsTitle">
        <ReviewRotator />
        <p className="reviews-note">디자인을 보여주기 위한 예시 리뷰와 별점이며, 실제 고객이 작성한 후기가 아닙니다.</p>
      </section>

      <section className="match-banner wrap">
        <div>
          <div className="eyebrow">A BOWL THAT’S SO YOU</div>
          <h2>내 취향대로, 한 번 더 새롭게.</h2>
          <p>좋아하는 재료에 하트를 보내고 나만의 샐러드를 만들어보세요.</p>
        </div>
        <a className="primary" href={MATCH_URL}>
          bowl match 시작하기 ♡
        </a>
      </section>

      <section className="allergy wrap">
        <strong>알레르기 안내</strong>
        <p>
          메뉴별 주요 알레르기 유발 재료를 옵션 화면에서 확인해주세요. 같은 조리 공간에서 우유, 대두, 밀, 계란, 견과류, 새우, 생선 등을
          취급하며 교차 접촉이 발생할 수 있습니다. 알레르기가 있다면 실제 주문 전 매장에 확인해주세요.
        </p>
      </section>

      <MatchFloat />
    </main>
  );
}
