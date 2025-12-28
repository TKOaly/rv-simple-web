import Link from "next/link";
import { userInfo } from "../utils";

// @ts-ignore
export default async function Layout({ children }) {
  const lastYear = new Date().getFullYear() - (new Date().getMonth() === 11 ? 0 : 1);
  const info = await userInfo();
  return (
    <>
      {
        <>
          <nav>
            <Link href="/userInfo">User info</Link>
            <br></br>
            <Link href="/productInfo">Product info</Link>
            <br></br>
            <Link href={"/stats/" + lastYear} prefetch={false}>{lastYear} in review</Link>
            <br></br>
            <div>
              {info && info.user.role === "ADMIN" &&
                <>
                  <Link href={"/inventory"} prefetch={false}>[Admin] Reports</Link>
                  <br></br>
                </>
              }
            </div>
            <Link href="/logout" prefetch={false}>Logout</Link>
          </nav>
          {children}
        </>
      }
    </>
  )
}
