import { cookies } from "next/headers"
import { formatMoney, API_URL } from "../utils"
import { redirect } from "next/navigation";

interface Product {
    barcode: string, name: string, category: { description: string }, sellPrice: number, stock: number
}
interface ProductsResponse {
    products: Product[]
}

function ProductTable(products: Product[]) {
    let rows = products
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(product => {
            return <>
                <tr>
                    <td>{product.name}</td>
                    <td>{formatMoney(product.sellPrice)}</td>
                    <td>{product.stock}</td>
                    <td>{product.barcode}</td>
                </tr>
            </>;
        });
    return <>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Barcode</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    </>
}

export default async function ProductList() {
    const response = await fetch(`${API_URL}/api/v1/products`, {
        headers: { "Authorization": "Bearer " + cookies().get("accessToken")?.value }
    })
    if(response.status === 401)
        redirect("/login")
    const body: ProductsResponse = await response.json();
    let productsInStock = body.products
        .filter(product => product.stock != 0);
    let productsNotInStock = body.products
        .filter(product => product.stock == 0);
    return <>
        <h3>Products in stock ({productsInStock.length} in total): </h3>
        {ProductTable(productsInStock)}
        <h3>Products not in stock ({productsNotInStock.length} in total): </h3>
        {ProductTable(productsNotInStock)}
    </>
}
