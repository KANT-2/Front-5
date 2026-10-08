import { publicSnapshot } from "@/lib/customer/catalog";
import { connection } from "next/server";
import { readCatalog } from "@/lib/admin/store";
export async function GET() {
  await connection();
  try {
    return Response.json(publicSnapshot(await readCatalog()), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "고객 데이터를 불러오지 못했습니다." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
