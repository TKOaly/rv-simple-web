import { pool } from "@/db";

// These functions are not exact for example issues with timezone, returned purchases, can returns etc. have not not been thought about

const TIME_LOWER_BOUND = "2024-01-01"
const TIME_UPPER_BOUND = "2025-01-01"


export async function items_bought_total(userId: string) {
  'use server'
  const result = (await pool.query<{
    count: string,
    sum: string
  }>(`
    SELECT SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '${TIME_LOWER_BOUND}'
    AND "ITEMHISTORY".time < '${TIME_UPPER_BOUND}';
  `)).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function items_bought_most_frequently(limit: number, userId: string) {
  'use server'
  const result = (await pool.query<{
    name: string,
    count: string,
    sum: string
  }>(`
    SELECT "RVITEM".descr as name, SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY "RVITEM".itemid, "RVITEM".descr
    ORDER BY count DESC
    LIMIT ${limit};
  `)).rows;
  return result.map(x => ({ name: x.name, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function items_bought_most_money(limit: number, userId: string) {
  'use server'
  const result = (await pool.query<{
    name: string,
    count: string,
    sum: string
  }>(`
    SELECT "RVITEM".descr as name, SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY "RVITEM".itemid, "RVITEM".descr
    ORDER BY sum DESC
    LIMIT ${limit};
  `)).rows;
  return result.map(x => ({ name: x.name, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function year_first_purchase(userId: string) {
  'use server'
  const result = (await pool.query<{
    time: Date,
  }>(`
      SELECT "ITEMHISTORY".time as time
      FROM "RVPERSON"
      LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
      JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
      JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
      LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
      WHERE "RVPERSON".userid=${userId}
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= '2024-01-01'
      AND "ITEMHISTORY".time < '2025-01-01'
      ORDER BY time ASC
      LIMIT 1;
  `)).rows;
  return result[0]
}

export async function year_last_purchase(userId: string) {
  'use server'
  const result = (await pool.query<{
    time: Date,
  }>(`
      SELECT "ITEMHISTORY".time as time
      FROM "RVPERSON"
      LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
      JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
      JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
      LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
      WHERE "RVPERSON".userid=${userId}
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= '2024-01-01'
      AND "ITEMHISTORY".time < '2025-01-01'
      ORDER BY time DESC
      LIMIT 1;
  `)).rows;
  return result[0]
}

export async function day_most_purchases(userId: string) {
  'use server'
  const result = (await pool.query<{
    time: Date,
    count: string,
    sum: string
  }>(`
      SELECT DATE("ITEMHISTORY".time) as time, SUM("PRICE".sellprice) as sum, COUNT(*) as count
      FROM "RVPERSON"
      LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
      JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
      JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
      LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
      WHERE "RVPERSON".userid=${userId}
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= '2024-01-01'
      AND "ITEMHISTORY".time < '2025-01-01'
      GROUP BY DATE("ITEMHISTORY".time)
      ORDER BY sum DESC
      LIMIT 10;
  `)).rows;
  return result.map(x => ({ time: x.time, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function purchase_distribution_hour(userId: string) {
  'use server'
  const result = (await pool.query<{
    hour: string,
    count: string,
    sum: string
  }>(`
    SELECT EXTRACT(HOUR FROM "ITEMHISTORY".time) as hour, SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY EXTRACT(HOUR FROM "ITEMHISTORY".time)
    ORDER BY hour ASC;
  `)).rows;
  return result.map(x => ({ hour: Number.parseInt(x.hour), count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function purchase_distribution_month(userId: string) {
  'use server'
  const result = (await pool.query<{
    month: string,
    count: string,
    sum: string
  }>(`
    SELECT EXTRACT(MONTH FROM "ITEMHISTORY".time) as month, SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY EXTRACT(MONTH FROM "ITEMHISTORY".time)
    ORDER BY month ASC;
  `)).rows;
  return result.map(x => ({ month: Number.parseInt(x.month), count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}


export async function purchase_distribution_dow(userId: string) {
  'use server'
  const result = (await pool.query<{
    dow: string,
    count: string,
    sum: string
  }>(`
    SELECT EXTRACT(DOW FROM "ITEMHISTORY".time) as dow, SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid=${userId}
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY EXTRACT(DOW FROM "ITEMHISTORY".time)
    ORDER BY DOW ASC;
  `)).rows;
  return result.map(x => ({ dow: (Number.parseInt(x.dow) - 1 + 7) % 7, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function all_total_purchases() {
  'use server'
  const result = (await pool.query<{
    count: string,
    sum: string
  }>(`
      SELECT SUM("PRICE".sellprice) as sum, COUNT(*) as count
      FROM "RVPERSON"
      LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
      JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
      JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
      LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
      WHERE "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= '2024-01-01'
      AND "ITEMHISTORY".time < '2025-01-01';
  `)).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function purchases_by_persons() {
  'use server'
  const result = (await pool.query<{
    count: string,
    sum: string
  }>(`
    SELECT SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    LEFT JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    LEFT JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= '2024-01-01'
    AND "ITEMHISTORY".time < '2025-01-01'
    GROUP BY "RVPERSON".userid
    ORDER BY sum asc;
  `)).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}