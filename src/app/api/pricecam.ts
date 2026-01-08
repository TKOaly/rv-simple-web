"use server"
import { pool } from "@/db";

export const getPrices = async () => {
  const res = await pool.query<{ name: string, price: number, barcode: string }>(`
      SELECT
            "RVITEM".descr as name,
            "PRICE".sellprice as price,
            "PRICE".barcode
          FROM
            "PRICE"
            LEFT JOIN "RVITEM" ON "PRICE".itemid = "RVITEM".itemid
          WHERE
            "PRICE".endtime IS NULL
            AND "PRICE".count != 0;`)
  const mp = new Map<string, { price: number, name: string }>();
  for (const row of res.rows) {
    mp.set(row.barcode, { price: row.price, name: row.name });
  }
  return mp;
};