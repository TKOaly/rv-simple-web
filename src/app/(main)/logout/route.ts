import { cookies } from "next/headers"
import { redirect, RedirectType } from "next/navigation"

export async function GET(request: Request) {
	await cookies().then(x => x.delete("accessToken"))
	redirect("/", RedirectType.replace)
}
