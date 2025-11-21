import { pool } from "@/db";

// These functions are not exact for example issues with timezone, returned purchases, can returns etc. have not not been thought about

export async function items_bought_total(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
  'use server'
  const result = (await pool.query<{
    count: string,
    sum: string
  }>(`
    SELECT SUM("PRICE".sellprice) as sum, COUNT(*) as count
    FROM "RVPERSON"
    JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
    JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
    JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
    JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
    WHERE "RVPERSON".userid =  $1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2::timestamptz
    AND "ITEMHISTORY".time < $3::timestamptz;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function items_bought_most_frequently(limit: number, userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
    WHERE "RVPERSON".userid=$1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2
    AND "ITEMHISTORY".time < $3
    GROUP BY "RVITEM".itemid, "RVITEM".descr
    ORDER BY count DESC
    LIMIT ${limit};
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ name: x.name, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function items_bought_most_money(limit: number, userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
    WHERE "RVPERSON".userid=$1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2
    AND "ITEMHISTORY".time < $3
    GROUP BY "RVITEM".itemid, "RVITEM".descr
    ORDER BY sum DESC
    LIMIT ${limit};
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ name: x.name, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function year_first_purchase(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
      WHERE "RVPERSON".userid=$1
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= $2
      AND "ITEMHISTORY".time < $3
      ORDER BY time ASC
      LIMIT 1;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result[0]
}

export async function year_last_purchase(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
      WHERE "RVPERSON".userid=$1
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= $2
      AND "ITEMHISTORY".time < $3
      ORDER BY time DESC
      LIMIT 1;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result[0]
}

export async function day_most_purchases(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
      WHERE "RVPERSON".userid=$1
      AND "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= $2
      AND "ITEMHISTORY".time < $3
      GROUP BY DATE("ITEMHISTORY".time)
      ORDER BY sum DESC
      LIMIT 10;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ time: x.time, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function purchase_distribution_hour(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
    WHERE "RVPERSON".userid=$1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2
    AND "ITEMHISTORY".time < $3
    GROUP BY EXTRACT(HOUR FROM "ITEMHISTORY".time)
    ORDER BY hour ASC;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ hour: Number.parseInt(x.hour), count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function purchase_distribution_month(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
    WHERE "RVPERSON".userid=$1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2
    AND "ITEMHISTORY".time < $3
    GROUP BY EXTRACT(MONTH FROM "ITEMHISTORY".time)
    ORDER BY month ASC;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ month: Number.parseInt(x.month), count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}


export async function purchase_distribution_dow(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
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
    WHERE "RVPERSON".userid=$1
    AND "ACTION".action = 'BOUGHT BY'
    AND "ITEMHISTORY".time >= $2
    AND "ITEMHISTORY".time < $3
    GROUP BY EXTRACT(DOW FROM "ITEMHISTORY".time)
    ORDER BY DOW ASC;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ dow: (Number.parseInt(x.dow) - 1 + 7) % 7, count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

export async function all_total_purchases(timeLowerBound: Date, timeUpperBound: Date) {
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
      AND "ITEMHISTORY".time >= $1
      AND "ITEMHISTORY".time < $2;
  `, [timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))[0]
}

export async function purchases_by_persons(timeLowerBound: Date, timeUpperBound: Date) {
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
    AND "ITEMHISTORY".time >= $1
    AND "ITEMHISTORY".time < $2
    GROUP BY "RVPERSON".userid
    ORDER BY sum asc;
  `, [timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ count: Number.parseInt(x.count), sum: Number.parseInt(x.sum) }))
}

// List of products for which most purchases during the year were made by the userId
export async function top_buyer_products(userId: string, timeLowerBound: Date, timeUpperBound: Date) {
  'use server'
  const result = (await pool.query<{
    count: string,
    descr: string
  }>(`
    SELECT descr, count FROM (
      SELECT DISTINCT ON("RVITEM".itemid) "RVPERSON".userid, "RVITEM".descr, COUNT(*) as count
      FROM "RVPERSON"
      JOIN "ITEMHISTORY" on "ITEMHISTORY".userid  = "RVPERSON".userid
      JOIN "ACTION" on "ITEMHISTORY".actionid = "ACTION".actionid
      JOIN "RVITEM" on "ITEMHISTORY".itemid = "RVITEM".itemid
      JOIN "PRICE" on "ITEMHISTORY".priceid1 = "PRICE".priceid
      WHERE "ACTION".action = 'BOUGHT BY'
      AND "ITEMHISTORY".time >= $2
      AND "ITEMHISTORY".time < $3
      GROUP BY "RVPERSON".userid, "RVITEM".itemid, "RVITEM".descr
      ORDER BY "RVITEM".itemid, count DESC)
    WHERE userid=$1 ORDER BY count DESC;
  `, [userId, timeLowerBound, timeUpperBound])).rows;
  return result.map(x => ({ descr: x.descr, count: x.count }))
}