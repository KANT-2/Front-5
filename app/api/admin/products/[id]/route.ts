// PATCH /api/admin/products/0  → 상품 수정 (관리자 화면용)
// 본문 예: { "price": 11900, "isOnSale": false }  보낸 항목만 바뀐다
// 관리자 로그인 확인은 2단계(관리자 계정)에서 추가한다.
import type { NextRequest } from "next/server";
import { parseProductUpdate } from "@/lib/product-validation";
import { findProductById, updateProduct } from "@/lib/products-repository";
import type { ApiError } from "@/types/api";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/products/[id]">) {
  const { id } = await ctx.params;
  const productId = /^\d+$/.test(id) ? Number(id) : NaN;

  if (Number.isNaN(productId) || !(await findProductById(productId))) {
    const error: ApiError = { message: "상품을 찾을 수 없습니다" };
    return Response.json(error, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const error: ApiError = { message: "요청 본문이 올바른 JSON 이 아닙니다" };
    return Response.json(error, { status: 400 });
  }

  const parsed = parseProductUpdate(body);
  if (!parsed.ok) {
    const error: ApiError = { message: parsed.message };
    return Response.json(error, { status: 400 });
  }

  return Response.json(await updateProduct(productId, parsed.value));
}
