export const API_URL = process.env.API_URL || "http://localhost:4040"
import { decode } from "jsonwebtoken";
import { cookies } from "next/headers"

export function formatMoney(cents: number): string {
    if (cents < 0) {
        cents = -cents;
        return "-" + Math.floor(cents / 100) + "." + (cents % 100).toString().padStart(2, '0')
    } else {
        return Math.floor(cents / 100) + "." + (cents % 100).toString().padStart(2, '0')
    }
}

export function formatDate(date: Date): string {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0");
}

export async function isTokenValid(): Promise<boolean> {
    const cookie = await cookies().then(x => x.get("accessToken"))
    if (!cookie?.value)
        return false

    const payload = decode(cookie.value)

    if (!payload || typeof payload === "string" || payload.exp === undefined)
        return false
    return payload.exp > Date.now() / 1000
}