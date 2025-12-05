import Login from "../components/login"
import { redirect } from "next/navigation"
import { isTokenValid } from "../utils"

export default async function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const redirectUrl = (typeof searchParams.redir === "string") ? searchParams.redir : "/userInfo";
    if (isTokenValid()) {
        redirect(redirectUrl)
    }
    return <>
        <Login redirectUrl={redirectUrl}></Login>
    </>
}
