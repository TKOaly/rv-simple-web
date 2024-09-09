import "./globals.css";
import Login from "./components/login";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>RV Simple Web</title>
      </head>
      <body>
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
                <Link href="/logout" prefetch={false}>Logout</Link>
              </nav>
              {children}
            </>
        }
      </body>
    </html>
  );
}
