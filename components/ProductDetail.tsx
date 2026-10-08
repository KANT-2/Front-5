"use client";
import Image from "next/image";
import { useState } from "react";
import { useCustomerCatalog } from "./CustomerCatalogProvider";
import { useCart } from "./CartProvider";
import { money, type Product } from "@/lib/products";

export default function ProductDetail({ product: p }: { product: Product }) {
  const {
    catalog,
    groupsFor,
    DRESSINGS,
    DRINKS,
    NUTRITION,
    DRESSING_KCAL,
    DRINK_KCAL,
  } = useCustomerCatalog();
  const { add, open } = useCart();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const groups = groupsFor(p.id).map((g) => ({
    ...g,
    choices:
      g.source === "custom"
        ? g.choices
        : catalog.products
            .filter(
              (c) =>
                c.type === (g.source === "drinks" ? "drink" : "dressing") &&
                !c.deleted &&
                c.status === "active",
            )
            .map((c) => ({
              id: c.id,
              name: c.name,
              price: c.price,
              image: c.image,
            })),
  }));
  const chosen = groups.flatMap((g) =>
    g.choices.filter((c) => (selected[g.id] ?? []).includes(c.id)),
  );
  const complete = groups.every(
    (g) =>
      !g.required ||
      g.choices.some((c) => (selected[g.id] ?? []).includes(c.id)),
  );
  const optionPrice = chosen.reduce((n, c) => n + c.price, 0);
  const dress = chosen.find(
    (c) => catalog.products.find((x) => x.id === c.id)?.type === "dressing",
  );
  const drinkChoices = chosen.filter(
    (c) => catalog.products.find((x) => x.id === c.id)?.type === "drink",
  );
  const dressing = dress ? DRESSINGS.findIndex((d) => d.id === dress.id) : -1;
  const drinks = drinkChoices.map((c) =>
    DRINKS.findIndex((d) => d.id === c.id),
  );
  const accounted =
    (dressing >= 0 ? DRESSINGS[dressing].price : 0) +
    drinks.reduce((n, i) => n + DRINKS[i].price, 0);
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!complete || p.status !== "active") return;
          add({
            id: p.id,
            dressing,
            drinks,
            qty,
            optionSelections: selected,
            extraPrice: optionPrice - accounted,
            extraOptions: chosen
              .filter((c) => c !== dress && !drinkChoices.includes(c))
              .map((c) => c.name),
          });
          open(
            e.currentTarget.querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            ),
          );
        }}
      >
        {groups.map((g) => (
          <fieldset key={g.id} className="option-list">
            <legend>
              {g.name}
              {g.required ? " (필수)" : ""}
            </legend>
            {g.choices.length ? (
              g.choices.map((c) => (
                <label key={c.id}>
                  <input
                    type={g.multiple ? "checkbox" : "radio"}
                    name={g.id}
                    checked={(selected[g.id] ?? []).includes(c.id)}
                    onChange={(e) =>
                      setSelected((current) => ({
                        ...current,
                        [g.id]: g.multiple
                          ? e.target.checked
                            ? [...(current[g.id] ?? []), c.id]
                            : (current[g.id] ?? []).filter((id) => id !== c.id)
                          : e.target.checked
                            ? [c.id]
                            : [],
                      }))
                    }
                  />
                  {c.name}
                  {c.price > 0 && <span> +{money(c.price)}</span>}
                  {"image" in c && typeof c.image === "string" && c.image && (
                    <span className="opt-preview" aria-hidden="true">
                      <Image
                        src={c.image}
                        alt=""
                        width={1024}
                        height={1024}
                        sizes="150px"
                      />
                    </span>
                  )}
                </label>
              ))
            ) : (
              <p>현재 선택 가능한 옵션이 없습니다.</p>
            )}
            {!g.required && !g.multiple && (
              <button
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [g.id]: [] }))}
              >
                선택 안 함
              </button>
            )}
          </fieldset>
        ))}
        {NUTRITION[p.id]?.kcal > 0 && (
          <p className="pv-kcal" aria-live="polite">
            선택한 구성 약{" "}
            <b>
              {NUTRITION[p.id].kcal +
                (DRESSING_KCAL[dressing] ?? 0) +
                drinks.reduce((n, i) => n + (DRINK_KCAL[i] ?? 0), 0)}
              kcal
            </b>
            <span>영양 예시 값 · 추가 토핑 영양은 포함되지 않습니다.</span>
          </p>
        )}
        <div className="allergen-box">
          주요 알레르기 재료:{" "}
          {[
            ...new Set([
              ...p.allergens,
              ...(DRESSINGS[dressing]?.allergens ?? []),
            ]),
          ].join(", ") || "표기 대상 없음"}
        </div>
        <div className="dialog-bottom pv-buy">
          <div className="qty">
            <button
              type="button"
              disabled={qty === 1}
              aria-label="수량 줄이기"
              onClick={() => setQty(qty - 1)}
            >
              −
            </button>
            <span>{qty}</span>
            <button
              type="button"
              disabled={qty === 99}
              aria-label="수량 늘리기"
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
          </div>
          <button
            className="primary"
            type="submit"
            disabled={p.status !== "active" || !complete}
          >
            {p.status === "soldout"
              ? "품절"
              : money((p.price + optionPrice) * qty) + " · 담기"}
          </button>
        </div>
      </form>
    </>
  );
}
