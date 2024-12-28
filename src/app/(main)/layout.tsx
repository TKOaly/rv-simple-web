import Login from "../components/login";
import { cookies } from "next/headers";
import Link from "next/link";

// @ts-ignore
export default function Layout({ children }) {
    return (
      <>
        {
          !cookies().has("accessToken") ?
            <>
              <Login></Login>
            </> :
            <>
              <nav>
                <Link href="/userInfo">User info</Link>
                <br></br>
                <Link href="/productInfo">Product info</Link>
                <br></br>
                <Link href="/2024" prefetch={false}>2024</Link>
                <br></br>
                <Link href="/logout" prefetch={false}>Logout</Link>
              </nav>
              {children}
            </>
        }
      </>
    )
  }
