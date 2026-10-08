"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCustomerCatalog } from "./CustomerCatalogProvider";
export default function CustomerSeasons() {
  const { catalog, visibleProducts } = useCustomerCatalog();
  const [index, setIndex] = useState(0);
  const content = catalog.content;
  const pages = (
    content.seasonPages ?? [
      {
        id: "season",
        title: content.seasonTitle,
        description: content.seasonDescription,
        image: content.seasonImage,
        productId: content.seasonProductId,
        visible: true,
      },
    ]
  ).filter((p) => p.visible);
  if (!content.seasonVisible || !pages.length) return null;
  const page = pages[index % pages.length];
  const adminProduct = catalog.products.find((p) => p.id === page.productId);
  const product = visibleProducts.find(
    (p) => p.id === adminProduct?.customerId,
  );
  const image = page.image || product?.imageUrl;
  return (
    <section className="monthly wrap" id="monthly">
      <div className="monthly-copy">
        <span className="pill">THIS MONTH’S PICK</span>
        <h2>{page.title}</h2>
        <p>{page.description}</p>
        {product && (
          <Link className="text-link" href={`/product/${product.id}`}>
            {product.name} 만나보기 ↗
          </Link>
        )}
        {pages.length > 1 && (
          <nav aria-label="시즌 페이지">
            <button
              onClick={() =>
                setIndex((index + pages.length - 1) % pages.length)
              }
              aria-label="이전 시즌"
            >
              ←
            </button>
            <span>
              {(index % pages.length) + 1} / {pages.length}
            </span>
            <button
              onClick={() => setIndex((index + 1) % pages.length)}
              aria-label="다음 시즌"
            >
              →
            </button>
          </nav>
        )}
      </div>
      <div className="monthly-food">
        {image && (
          <Image
            className="food-image"
            src={image}
            alt={product?.name ?? page.title}
            width={1024}
            height={1024}
            sizes="(max-width:600px) 280px,40vw"
          />
        )}
      </div>
      <div className="monthly-caption">
        <span>NEW COMBINATION</span>
        <strong>{product?.en || product?.name || page.title}</strong>
      </div>
    </section>
  );
}
