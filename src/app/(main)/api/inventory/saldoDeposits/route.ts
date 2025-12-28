import { userInfo } from "@/app/utils";
import { pool } from "@/db";
import { writeToString } from "@fast-csv/format";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const info = await userInfo();
  if (!info || info.user.role !== "ADMIN") {
    return new Response("unauthorized", { status: 401 })
  }
  const year = Number.parseInt(request.nextUrl.searchParams.get("year") ?? "0");
  if (!Number.isFinite(year) || !(year >= 1900 && year <= 3000)) {
    // ugly?
    return new Response("bad year", {
      status: 400,
    });
  }
  const res = await pool.query(
      /* sql */ `
        SELECT
          "RVPERSON".name,
          "ACTION".action,
          "SALDOHISTORY".difference,
          "PERSONHIST".time
        FROM
          "PERSONHIST"
          JOIN "SALDOHISTORY" ON "PERSONHIST".saldhistid = "SALDOHISTORY".saldhistid
          JOIN "ACTION" ON "PERSONHIST".actionid = "ACTION".actionid
          JOIN "RVPERSON" ON "RVPERSON".userid = "PERSONHIST".userid1
        WHERE
        "PERSONHIST".time >= '01-01-${year}'
        AND "PERSONHIST".time < '01-01-${year + 1}'
        ORDER BY
          "PERSONHIST".time;
      `,
  );
  return new Response(await writeToString(res.rows, { headers: true }), {
    status: 200,
    headers: {
      "Content-Type": "text/csv"
    }
  });
}
