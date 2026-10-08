import { redirect } from "next/navigation";

// 리다이렉트만 하는 페이지라 즉시 이동 검증 대상이 아니다.
export const instant = false;

export default function ReviewsIndex() {
  redirect("/product/0/reviews");
}
