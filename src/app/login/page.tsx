import { cookies } from "next/headers"
import Login from "../components/login"
import { redirect } from "next/navigation"

export default async function Page() {
    if (cookies().has("accessToken")) {
        redirect("/userInfo")
    }
    return <>
        <Login></Login>
    </>
}
