'use client'
import "./globals.css"
import AuthLayout from "@/components/AuthLayout";
import GuestLayout from "@/components/GuestLayout";
import { AppContextProvider } from "@/providers/AppContextProviders";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  // log of current client set up
  const [auth, setAuth] = useState(false)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (window && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`./${dark ? "white" : "dark"}_sail.svg?v=2`} type="image/x-icon" />
        <title>Quote Mind</title>
      </head>
      <body className={`root h-screen w-screen`}>
        <AppContextProvider>
          {auth?(
            <AuthLayout>{children}</AuthLayout>
          ):(
            <GuestLayout>{children}</GuestLayout>
          )}
        </AppContextProvider>
      </body>
    </html>
  );
}
