import "./globals.css";

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
          {children}
      </body>
    </html>
  );
}
