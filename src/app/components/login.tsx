import { cookies } from "next/headers"
import { API_URL } from "../utils"
import { redirect } from "next/navigation"

export default function Login() {
    async function loginAction(formData: FormData) {
        'use server'
        const username = formData.get("username")
        const password = formData.get("password")
        const response = await fetch(`${API_URL}/api/v1/authenticate`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ username: username, password: password }) })
        const data = await response.json()
        if (response.status == 200) {
            cookies().set('accessToken', data.accessToken)
            redirect("/")
        } else {
        }
    }
    return <>
        <form action={loginAction}>
            <label htmlFor="username">Username:</label>
            <input name="username" type="text" />
            <br></br>
            <label htmlFor="password">Password:</label>
            <input name="password" type="password" />
            <br></br>
            <input type="submit" value="Login" />
        </form>
    </>
}
