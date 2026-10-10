import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dataDirectory } from './store';
import { salesDataSchema, type SalesData } from './sales';

// Replace this adapter with the real order/POS repository when available.
// Missing data is distinct from connected data with zero orders.
export async function readSalesData(): Promise<SalesData | null> {
  let raw: string;
  try {
    raw = await readFile(path.join(dataDirectory(), 'sales-orders.json'), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
  return salesDataSchema.parse(JSON.parse(raw));
}
