import Link from "next/link";
import FoodImage from "@/components/FoodImage";
import HeroCarousel from "@/components/HeroCarousel";
import MatchFloat from "@/components/MatchFloat";
import ProductCard from "@/components/ProductCard";
import ReviewRotator from "@/components/ReviewRotator";
import { getHeroSlides } from "@/lib/data/hero";
import { MATCH_URL, PRODUCTS } from "@/lib/products";

export default async function Home() {
  const slides = await getHeroSlides();
  return (
    <main>
      <HeroCarousel slides={slides} />

      <section className="section wrap" id="best">
        <div className="section-title">
          <div>
            <div className="eyebrow">YOUR NEXT FAVORITE</div>
            <h2>
              Best bowls<span>자꾸 생각나는 한 그릇</span>
            </h2>
          </div>
          <Link href="/menu">전체 메뉴 보기 ↗</Link>
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

      <section className="section reviews wrap" id="reviews" aria-labelledby="reviewsTitle">
        <ReviewRotator />
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
