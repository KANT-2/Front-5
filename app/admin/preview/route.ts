import { connection } from 'next/server';
import {readCatalog} from '@/lib/admin/store';
import {customerTemplate} from '@/lib/admin/customer-template';
export async function GET(){await connection();const {catalog}=await readCatalog();const data=JSON.stringify(catalog).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');return new Response(customerTemplate.replace('__CATALOG__',()=>data),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});}
