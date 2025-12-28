import { cookies } from "next/headers"
import { API_URL } from "../utils"
import { redirect, RedirectType } from "next/navigation"

export default function Login({ redirectUrl }: { redirectUrl?: string }) {
    async function loginAction(formData: FormData) {
        'use server'
        const username = formData.get("username")
        const password = formData.get("password")
        const redirectUrl = formData.get("redirectUrl");
        const response = await fetch(`${API_URL}/api/v1/authenticate`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ username: username, password: password }) })
        const data = await response.json()
        if (response.status == 200) {
            await cookies().then(x => x.set('accessToken', data.accessToken))
            redirect(redirectUrl != null && redirectUrl.toString().length > 0 ? redirectUrl.toString() : "/userInfo", RedirectType.replace)
        } else {
        }
    }
    console.log("r", redirectUrl)
    return <>
        <form action={loginAction}>
            <label htmlFor="username">Username:</label>
            <input name="username" type="text" />
            <br></br>
            <label htmlFor="password">Password:</label>
            <input name="password" type="password" />
            <input type="hidden" name="redirectUrl" value={redirectUrl} />
            <br></br>
            <input type="submit" value="Login" />
        </form>
    </>
}
