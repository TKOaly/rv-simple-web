import Login from "../../components/login"
import { redirect } from "next/navigation"
import { isTokenValid } from "../../utils"

export default async function Page() {
    if (isTokenValid()) {
        redirect("/userInfo")
    }
    return <>
        <Login></Login>
    </>
}
