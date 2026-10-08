import { publicSnapshot } from "@/lib/customer/catalog";
import { z } from "zod";
import { appendCustomerReview } from "@/lib/admin/store";
import {
  sameOrigin,
  readLimited,
  BodyTooLarge,
  jsonError,
} from "@/lib/admin/server";
const schema = z.object({
  id: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .max(80),
  pid: z.number().int().nonnegative(),
  author: z.string().trim().min(1).max(80),
  stars: z.number().int().min(1).max(5),
  title: z.string().trim().min(2).max(200),
  text: z.string().trim().min(10).max(10000),
  via: z.enum(["pickup", "delivery"]),
});
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  try {
    const body = JSON.parse(
      new TextDecoder().decode(await readLimited(request, 16000)),
    );
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("리뷰 내용을 확인해주세요.");
    return Response.json(
      publicSnapshot(await appendCustomerReview(parsed.data)),
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    if (e instanceof BodyTooLarge) return jsonError("리뷰가 너무 큽니다.", 413);
    return jsonError("리뷰를 저장하지 못했습니다. 다시 시도해주세요.", 503);
  }
}
