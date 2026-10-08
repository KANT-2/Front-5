import "server-only";
import { connection } from "next/server";
import { readCatalog } from "@/lib/admin/store";
import { customerCatalog } from "./catalog";
export async function readCustomerCatalog() {
  await connection();
  return customerCatalog(await readCatalog());
}
