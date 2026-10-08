import Image from "next/image";
import { PRODUCTS, photoSrc } from "@/lib/products";

interface Props {
  id: number;
  sizes: string;
  className?: string;
  /** 첫 화면에 바로 보이는 큰 이미지만 true */
  preload?: boolean;
  eager?: boolean;
}

/** 투명 배경 샐러드 컷아웃. 배경색은 감싸는 요소의 CSS 가 준다. */
export default function FoodImage({ id, sizes, className = "", preload = false, eager = false }: Props) {
  return (
    <Image
      className={`food-image ${className}`.trim()}
      src={photoSrc(id)}
      alt={PRODUCTS[id].name}
      width={1024}
      height={1024}
      sizes={sizes}
      preload={preload}
      loading={preload || eager ? "eager" : "lazy"}
    />
  );
}
