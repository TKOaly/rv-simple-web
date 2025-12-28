import { userInfo } from "@/app/utils";
import { pool } from "@/db";
import { writeToString } from "@fast-csv/format";

export async function GET(request: Request) {
  const info = await userInfo();
  if (!info || info.user.role !== "ADMIN") {
    return new Response("unauthorized", { status: 401 })
  }
  const res = await pool.query<{ descr: string, price: number, barcode: string }>(`
        SELECT
          "RVITEM".descr,
          "PRICE".barcode,
          "PRICE".count,
          "PRICE".buyprice,
          "PRICE".sellprice
        FROM
          "RVITEM"
          JOIN "PRICE" ON "PRICE".itemid = "RVITEM".itemid
          AND "PRICE".endtime IS NULL
        WHERE
          "PRICE".count > 0
        ORDER BY
          "PRICE".count DESC;
      `)
  return new Response(await writeToString(res.rows, { headers: true }), {
    status: 200,
    headers: {
      "Content-Type": "text/csv"
    }
  });
}
