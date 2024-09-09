import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
    if (cookies().has("accessToken")) {
        redirect("/userInfo")
    } else {
        redirect("/login")
    }
}