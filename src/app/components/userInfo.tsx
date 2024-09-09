import { cookies } from "next/headers"
import { formatMoney, API_URL } from "../utils"

interface UserResponse {
    user: {
        username: string,
        fullName: string,
        email: string,
        moneyBalance: number,
        role: string
    }
}

export default async function UserInfo() {
    const response = await fetch(`${API_URL}/api/v1/user`, {
        headers: { "Authorization": "Bearer " + cookies().get("accessToken")?.value }
    })
    const body: UserResponse = await response.json();
    return <>
        <h3>User info:</h3>
        <table>
            <thead>
                <tr>
                    <th>username</th>
                    <th>full name</th>
                    <th>email</th>
                    <th>role</th>
                    <th>balance</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{body.user.username}</td>
                    <td>{body.user.fullName}</td>
                    <td>{body.user.email}</td>
                    <td>{body.user.role}</td>
                    <td>{formatMoney(body.user.moneyBalance)}</td>
                </tr>
            </tbody>
        </table>
    </>
}
