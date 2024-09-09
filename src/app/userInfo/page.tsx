import DepositHistory from "../components/depositHistory"
import PurchaseHistory from "../components/purchaseHistory"
import UserInfo from "../components/userInfo"

export default async function Page() {
    return <>
        <UserInfo></UserInfo>
        <DepositHistory></DepositHistory>
        <PurchaseHistory></PurchaseHistory>
    </>
}
