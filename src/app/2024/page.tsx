import { cookies } from "next/headers";
import { all_total_purchases, day_most_purchases, items_bought_most_frequently, items_bought_most_money, items_bought_total, purchase_distribution_dow, purchase_distribution_hour, purchase_distribution_month, purchases_by_persons, year_first_purchase, year_last_purchase } from "../api/2024"
import BarPlot from "../components/barPlot";
import { API_URL, formatMoney } from "../utils";
import { redirect } from "next/navigation";

const errHandler = (err: any) => {
    console.error(err);
    return undefined
};

export default async function Page() {
    `use server`

    const response = await fetch(`${API_URL}/api/v1/user`, {
        headers: { "Authorization": "Bearer " + cookies().get("accessToken")?.value }
    })
    if (response.status === 401)
        redirect("/login")

    const userid = await response.json().then(x => x.user.userId)


    const total_purchases = await items_bought_total(userid).catch(errHandler);
    const most_bought_by_count = await items_bought_most_frequently(10, userid)
        .then(res => res.map(x => <tr>
            <td>{x.name}</td>
            <td>{x.count}</td>
        </tr>)).catch(errHandler);
    const most_bought_by_sum = await items_bought_most_money(10, userid)
        .then(res => res.map(x => <tr>
            <td>{x.name}</td>
            <td>{formatMoney(x.sum)}€</td>
        </tr>)).catch(errHandler);
    const first_purchase = await year_first_purchase(userid).catch(errHandler);
    const last_purchase = await year_last_purchase(userid).catch(errHandler);
    const most_purchases_day = await day_most_purchases(userid).catch(errHandler)

    const all_total = await all_total_purchases().catch(errHandler)

    const distrib_hour = await purchase_distribution_hour(userid)
        .then(x =>
        (<>{BarPlot(0, 24, new Map(x.map(x => ([x.hour, x.sum]
        ))))}</>
        ))
        .catch(errHandler)
    const distrib_month = await purchase_distribution_month(userid)
        .then(x =>
        (<>{BarPlot(1, 12, new Map(x.map(x => ([x.month, x.sum]
        ))))}</>
        ))
        .catch(errHandler)
    const distrib_dow = await purchase_distribution_dow(userid)
        .then(x =>
        (<>{BarPlot(0, 6, new Map(x.map(x => ([x.dow, x.sum]
        ))))}</>
        ))
        .catch(errHandler)
    const spent_by_others = await purchases_by_persons()
        .catch(errHandler)
    return <>
        <h2>RV 2024 stats</h2>
        {total_purchases && all_total && spent_by_others ?
            <>
                <p>During the year you bought {total_purchases.count} items worth {formatMoney(total_purchases.sum)}€ (average purchase {formatMoney(Math.round(total_purchases.sum / total_purchases.count))}€).</p>
                <p>They represent {Math.ceil(total_purchases.count / all_total.count * 10000) / 100}% of total purchases from RV and {Math.ceil(total_purchases.sum / all_total.sum * 10000) / 100}% of the 2024 revenue.</p>
                <br></br>
                <p>You spent more than {
                    Math.round(spent_by_others.filter(x => x.sum < total_purchases.sum).length / spent_by_others.length * 100)
                }%
                    and made more purchases than {
                        Math.round(spent_by_others.filter(x => x.count < total_purchases.count).length / spent_by_others.length * 100)

                    }%
                    of other RV users.</p>
                <br></br>
            </>
            : ""}
        {first_purchase ?
            <>
                <p>First purchase of the year on {first_purchase.time.toLocaleDateString()} at {first_purchase.time.toLocaleTimeString()}</p>
                <br></br>
            </>
            : ""}
        {last_purchase ?
            <>
                <p>Last purchase of the year on {last_purchase.time.toLocaleDateString()} at {last_purchase.time.toLocaleTimeString()}</p>
                <br></br>
            </>
            : ""}
        {most_bought_by_count ?
            <>
                <table>
                    <caption>Top purchases by count</caption>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {most_bought_by_count}
                    </tbody>
                </table>
                <br></br>
            </>
            : ""}
        {most_bought_by_sum ?
            <>
                <table>
                    <caption>Top purchases by money spent</caption>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>sum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {most_bought_by_sum}
                    </tbody>
                </table>
                <br></br>
            </>
            : ""}
        {most_purchases_day ?
            <>
                <p>Most purchases done on {most_purchases_day.time.toLocaleDateString()} ({most_purchases_day.count} in total with the sum of {formatMoney(most_purchases_day.sum)}€).</p>
                <br></br>
            </> : ""}


        {distrib_hour ?
            <>
                <p>Spent money by hour.</p>
                {distrib_hour}
                <br></br>
            </> : ""}
        {distrib_month ?
            <>
                <p>Spent money by month.</p>
                {distrib_month}
                <br></br>
            </> : ""}
        {distrib_dow ?
            <>
                <p>Spent money by day of the week (0 = monday).</p>
                {distrib_dow}
                <br></br>
            </> : ""}
    </>
}
