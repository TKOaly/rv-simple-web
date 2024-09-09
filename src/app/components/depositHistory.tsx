import { cookies } from "next/headers"
import { formatDate, formatMoney, API_URL } from "../utils"

interface DepositHistoryResponse {
    deposits: { time: string, amount: number, balanceAfter: number }[]
}

export default async function DepositHistory() {
    const response = await fetch(`${API_URL}/api/v1/user/depositHistory`, {
        headers: { "Authorization": "Bearer " + cookies().get("accessToken")?.value }
    })
    const body: DepositHistoryResponse = await response.json();
    let totalDeposited = body.deposits.reduce((pv, deposit) => pv + deposit.amount, 0)
    let rows = body.deposits.map(deposit => {
        return <>
            <tr>
                <td>{formatDate(new Date(deposit.time))}</td>
                <td>{formatMoney(deposit.amount)}</td>
            </tr>
        </>;
    });
    return <>
        <h3>Deposits ({body.deposits.length} in total {formatMoney(totalDeposited)}€): </h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </>
}
