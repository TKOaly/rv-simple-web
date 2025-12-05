import { cookies } from "next/headers"
import { redirect, RedirectType } from "next/navigation"

export async function GET(request: Request) {
	cookies().delete("accessToken")
	redirect("/", RedirectType.replace)
}
