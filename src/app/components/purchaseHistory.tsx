import { cookies } from "next/headers"
import { formatDate, formatMoney, API_URL } from "../utils"
import { redirect } from "next/navigation"

interface PurchaseHistoryResponse {
    purchases: { time: string, product: { barcode: string, name: string }, price: number, returned: boolean }[]
}

export default async function DepositHistory() {
    const response = await fetch(`${API_URL}/api/v1/user/purchaseHistory`, {
        headers: { "Authorization": "Bearer " + cookies().get("accessToken")?.value }
    })
    if(response.status === 401)
        redirect("/login")
    const body: PurchaseHistoryResponse = await response.json();
    let rows = body.purchases.map(purchase => {
        return <>
            <tr>
                <td>{formatDate(new Date(purchase.time))}</td>
                <td>{purchase.product.name}</td>
                <td>{formatMoney(purchase.price)}</td>
                <td>{purchase.returned ? "returned" : ""}</td>

            </tr>
        </>;
    });
    let totalPurchased = body.purchases.reduce((pv, purchase) => pv + (purchase.returned ? 0 : purchase.price), 0)
    let totalReturned = body.purchases.reduce((pv, purchase) => pv + (purchase.returned ? purchase.price : 0), 0)

    return <>
        <h3>Purchases ({body.purchases.length} in total): </h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Returned</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </>
}
