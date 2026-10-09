import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { customerSeed, migrateCatalog } from "./customer-seed";
import { type Catalog, type Snapshot } from "./catalog";
type StoredSnapshot = Snapshot & {
  schemaVersion?: number;
  nextCustomerId?: number;
  deletedReviewIds?: string[];
};
function publicSnapshot(state: StoredSnapshot): Snapshot {
  return { catalog: state.catalog, revision: state.revision, updatedAt: state.updatedAt };
}
export const dataDirectory = () =>
  process.env.ADMIN_DATA_DIR || path.resolve(process.cwd(), ".data/admin");
async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const directory = dataDirectory();
  await mkdir(directory, { recursive: true });
  const lock = path.join(directory, ".lock");
  let acquired = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await mkdir(lock);
      acquired = true;
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  if (!acquired)
    throw Error("다른 저장 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.");
  try {
    return await fn();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}
async function readState(): Promise<StoredSnapshot> {
  try {
    const snapshot: StoredSnapshot = JSON.parse(
      await readFile(path.join(dataDirectory(), "catalog.json"), "utf8"),
    );
    if (snapshot.schemaVersion !== 3) {
      try {
        await writeFile(
          path.join(dataDirectory(), "catalog.v1.backup.json"),
          JSON.stringify(snapshot),
          { flag: "wx" },
        );
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      }
      snapshot.catalog = migrateCatalog(snapshot.catalog, true);
      const deletedIds = new Set(snapshot.deletedReviewIds ?? []);
      snapshot.catalog.reviews = snapshot.catalog.reviews?.filter(review => !deletedIds.has(review.id));
      snapshot.revision++;
      snapshot.updatedAt = new Date().toISOString();
      await writeState(snapshot);
    }
    return snapshot;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const snapshot = {
      catalog: customerSeed(),
      revision: 1,
      updatedAt: new Date().toISOString(),
    };
    await writeState(snapshot);
    return snapshot;
  }
}
async function writeState(snapshot: StoredSnapshot) {
  const target = path.join(dataDirectory(), "catalog.json"),
    temp = target + "." + crypto.randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify({ ...snapshot, schemaVersion: 3 }));
  await rename(temp, target);
}
export async function readCatalog(): Promise<Snapshot> {
  return withLock(async () => publicSnapshot(await readState()));
}
export async function writeCatalog(
  catalog: Catalog,
  revision: number,
): Promise<Snapshot | null> {
  return withLock(async () => {
    const current = await readState();
    if (current.revision !== revision) return null;
    let nextId =
      Math.max(current.nextCustomerId ?? 12, Math.max(11, ...current.catalog.products.map((p) => p.customerId ?? -1)) + 1);
    const incomingReviews = catalog.reviews ?? current.catalog.reviews ?? [];
    const incomingReviewIds = new Set(incomingReviews.map(review => review.id));
    const deletedReviewIds = new Set(current.deletedReviewIds ?? []);
    for (const review of current.catalog.reviews ?? []) {
      if (!incomingReviewIds.has(review.id)) deletedReviewIds.add(review.id);
    }
    const normalized = {
      ...catalog,
      reviews: incomingReviews.filter(review => !deletedReviewIds.has(review.id)),
      products: catalog.products.map((p) => ({
        ...p,
        customerId:
          p.type === "salad"
            ? (current.catalog.products.find((old) => old.id === p.id)
                ?.customerId ?? nextId++)
            : undefined,
      })),
    };
    const snapshot = {
      catalog: migrateCatalog(normalized),
      nextCustomerId: nextId,
      deletedReviewIds: [...deletedReviewIds],
      revision: revision + 1,
      updatedAt: new Date().toISOString(),
    };
    await writeState(snapshot);
    return publicSnapshot(snapshot);
  });
}

export async function appendCustomerReview(input: {
  id: string;
  pid: number;
  author: string;
  stars: number;
  title: string;
  text: string;
  via: "pickup" | "delivery";
}): Promise<Snapshot> {
  return withLock(async () => {
    const current = await readState();
    if (current.deletedReviewIds?.includes(input.id)) return publicSnapshot(current);
    const product = current.catalog.products.find(
      (p) =>
        p.customerId === input.pid &&
        p.type === "salad" &&
        !p.deleted &&
        p.status !== "hidden",
    );
    if (!product) throw Error("해당 메뉴에 리뷰를 작성할 수 없습니다.");
    if(current.catalog.reviews?.some(r=>r.id===input.id))return publicSnapshot(current);
    if((current.catalog.reviews??[]).length>=500)throw Error('리뷰 등록 한도에 도달했습니다.');
    const createdAt = new Date().toISOString();
    const review = {
      id: input.id,
      productId: product.id,
      author: input.author,
      rating: input.stars,
      title: input.title,
      body: input.text,
      via: input.via,
      menu: product.name,
      date: createdAt.slice(0, 10).replaceAll("-", "."),
      createdAt,
      deleted: false,
    };
    const next = {
      nextCustomerId: current.nextCustomerId,
      deletedReviewIds: current.deletedReviewIds,
      catalog: {
        ...current.catalog,
        reviews: [review, ...(current.catalog.reviews ?? [])],
      },
      revision: current.revision + 1,
      updatedAt: createdAt,
    };
    await writeState(next);
    return publicSnapshot(next);
  });
}
