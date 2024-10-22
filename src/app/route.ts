import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isTokenValid } from "./utils"

export async function GET(request: Request) {
    if (isTokenValid()) {
        redirect("/userInfo")
    } else {
        redirect("/login")
    }
}