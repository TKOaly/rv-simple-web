import { userInfo } from "@/app/utils";
import { pool } from "@/db";
import { writeToString } from "@fast-csv/format";
import { NextRequest } from "next/server";
import { QueryResult } from "pg";

const TZ = "Europe/Helsinki";

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
  const saldoDepositsByMonth = await pool.query(/* sql */ `
      -- Saldo deposits by month and type
      SELECT
        "ACTION".action,
        sum("SALDOHISTORY".difference),
        EXTRACT(
          MONTH
          FROM
            "PERSONHIST".time AT TIME ZONE '${TZ}'
        ) AS "month"
      FROM
        "PERSONHIST"
        JOIN "SALDOHISTORY" ON "PERSONHIST".saldhistid = "SALDOHISTORY".saldhistid
        JOIN "ACTION" ON "PERSONHIST".actionid = "ACTION".actionid
      WHERE
        "PERSONHIST".time >= '01-01-${year}'
        AND "PERSONHIST".time < '01-01-${year + 1}'
      GROUP BY
        EXTRACT(
          MONTH
          FROM
            "PERSONHIST".time AT TIME ZONE '${TZ}'
        ),
        "ACTION".action
      ORDER BY
        "month",
        "ACTION".action;
    `);
  const purchasesByMonth = await pool.query(/* sql */ `
      -- Purchases (no bottle returns) by month
      SELECT
        "ACTION".action,
        sum("PRICE".sellprice),
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ) AS "month"
      FROM
        "ITEMHISTORY"
        JOIN "ACTION" ON "ITEMHISTORY".actionid = "ACTION".actionid
        JOIN "PRICE" ON "ITEMHISTORY".priceid1 = "PRICE".priceid
        JOIN "RVITEM" ON "PRICE".itemid = "RVITEM".itemid
      WHERE
        time >= '01-01-${year}'
        AND time < '01-01-${year + 1}'
        AND "PRICE".sellprice > 0
        AND "ACTION".action = 'BOUGHT BY'
      GROUP BY
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ),
        "ACTION".action
      ORDER BY
        "month";
    `);
  const purchaseReturnsByMonth = await pool.query(/* sql */ `
      -- Product returns (as in undoed purchases) by month
      SELECT
        "ACTION".action,
        sum("PRICE".sellprice),
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ) AS "month"
      FROM
        "ITEMHISTORY"
        JOIN "ACTION" ON "ITEMHISTORY".actionid = "ACTION".actionid
        JOIN "PRICE" ON "ITEMHISTORY".priceid1 = "PRICE".priceid
        JOIN "RVITEM" ON "PRICE".itemid = "RVITEM".itemid
      WHERE
        time >= '01-01-${year}'
        AND time < '01-01-${year + 1}'
        AND "PRICE".sellprice > 0
        AND "ACTION".action = 'PRODUCT RETURNED'
      GROUP BY
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ),
        "ACTION".action
      ORDER BY
        "month";
    `);
  const bottleReturnsByMonth = await pool.query(/* sql */ `
      -- Bottle returns by month
      SELECT
        "ACTION".action,
        sum("PRICE".sellprice),
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ) AS "month"
      FROM
        "ITEMHISTORY"
        JOIN "ACTION" ON "ITEMHISTORY".actionid = "ACTION".actionid
        JOIN "PRICE" ON "ITEMHISTORY".priceid1 = "PRICE".priceid
        JOIN "RVITEM" ON "PRICE".itemid = "RVITEM".itemid
      WHERE
        time >= '01-01-${year}'
        AND time < '01-01-${year + 1}'
        AND "PRICE".sellprice < 0
        AND "ACTION".action = 'BOUGHT BY'
      GROUP BY
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ),
        "ACTION".action
      ORDER BY
        "month";
    `);
  const bottleReturnReturnsByMonth = await pool.query(/* sql */ `
      -- Bottle return refunds (as in undoed purchases) by month
      SELECT
        "ACTION".action,
        sum("PRICE".sellprice),
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ) AS "month"
      FROM
        "ITEMHISTORY"
        JOIN "ACTION" ON "ITEMHISTORY".actionid = "ACTION".actionid
        JOIN "PRICE" ON "ITEMHISTORY".priceid1 = "PRICE".priceid
        JOIN "RVITEM" ON "PRICE".itemid = "RVITEM".itemid
      WHERE
        time >= '01-01-${year}'
        AND time < '01-01-${year + 1}'
        AND "PRICE".sellprice < 0
        AND "ACTION".action = 'PRODUCT RETURNED'
      GROUP BY
        EXTRACT(
          MONTH
          FROM
            "ITEMHISTORY".time AT TIME ZONE '${TZ}'
        ),
        "ACTION".action
      ORDER BY
        "month";
    `);
  let rows = [[year.toString()]];
  for (let i = 1; i <= 12; i++) {
    rows[0].push(i.toString());
  }

  // Safely convert e.g. 150 -> 1.50
  function centsToEuros(cents: string): string {
    if (cents[0] === "-") {
      cents = "-" + cents.substring(1).padStart(3, "0")
      return (
        cents.substring(0, cents.length - 2) +
        "." +
        cents.substring(cents.length - 2)
      );
    } else {
      cents = cents.padStart(3, "0")
      return (
        cents.substring(0, cents.length - 2) +
        "." +
        cents.substring(cents.length - 2)
      );
    }
  }

  function extractRows(
    actionType: { action: string; name: string }[],
    data: QueryResult<any>,
  ): string[][] {
    let rows: string[][] = [];
    for (const { action, name } of actionType) {
      let row = [name];
      for (let i = 1; i <= 12; i++) {
        row.push(
          centsToEuros(
            data.rows.find((x) => x.month == i && x.action == action)?.sum ??
            "0",
          ),
        );
      }
      rows.push(row);
    }
    return rows;
  }

  rows = rows.concat(
    extractRows(
      [
        { action: "DEPOSITED MONEY CASH", name: "saldo deposits (cash)" },
        {
          action: "DEPOSITED MONEY BANKTRANSFER",
          name: "saldo deposits (bank)",
        },
      ],
      saldoDepositsByMonth,
    ),
  );
  rows = rows.concat(
    extractRows(
      [{ action: "BOUGHT BY", name: "purchases" }],
      purchasesByMonth,
    ),
  );
  rows = rows.concat(
    extractRows(
      [{ action: "PRODUCT RETURNED", name: "purchases (returned/refunded)" }],
      purchaseReturnsByMonth,
    ),
  );
  rows = rows.concat(
    extractRows(
      [{ action: "BOUGHT BY", name: "bottle returns" }],
      bottleReturnsByMonth,
    ),
  );
  rows = rows.concat(
    extractRows(
      [
        {
          action: "PRODUCT RETURNED",
          name: "bottle returns (returned/refunded)",
        },
      ],
      bottleReturnReturnsByMonth,
    ),
  );
  return new Response(await writeToString(rows, { headers: true }), {
    status: 200,
    headers: {
      "Content-Type": "text/csv"
    }
  });
}
