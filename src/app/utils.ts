export const API_URL = process.env.API_URL || "http://localhost:4040"

export function formatMoney(cents: number): string {
    if (cents < 0) {
        cents = -cents;
        return "-" + Math.floor(cents / 100) + "." + (cents % 100).toString().padStart(2, '0')
    } else {
        return Math.floor(cents / 100) + "." + (cents % 100).toString().padStart(2, '0')
    }
}

export function formatDate(date: Date): string {
    return date.getFullYear() + "-" + date.getMonth().toString().padStart(2, "0") + "-" + date.getDay().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ":" + date.getSeconds().toString().padStart(2, "0");
}