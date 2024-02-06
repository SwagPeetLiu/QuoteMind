'use client'
import { useAppContext } from "@/providers/AppContextProviders"
import { useState } from "react"

// this components controlls the overall UI of Application header
function Header() {
    const [auth, setAuth] = useState(false)
    const appContext = useAppContext()

    return (
        <div className={`z-99 flex flex-row items-center justify-between w-full ${auth? "h-[12%] text-[var(--black)] shadow-lg" : "h-[15%] text-[var(--white)]" }`}>
            <div className="flex flex-row items-center h-full">
                <img id="smart-glow" src={`./${auth? "dark": "white"}_sail.svg`} className="h-[80%] m-6" />
                <p id="smart-glow" className="font-semibold text-[2.8vw]"> QuoteMind </p>
            </div>
            <p id="smart-glow" className="font-semibold order-last text-[2vw] mr-10">Login</p>
        </div>
    )
}

export default Header