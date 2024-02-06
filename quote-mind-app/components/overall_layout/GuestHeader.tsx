'use client'
import { useAppContext } from "@/providers/AppContextProviders"
import { useState } from "react"

// this components controlls the overall UI of Application header
function GuestHeader() {
    const strings = useAppContext().strings

    return (
        <div className={`z-99 flex flex-row items-center justify-between w-full h-[15%] text-[var(--white)]`}>
            <div className="flex flex-row items-center h-full">
                <img id="smart-glow" src={`./white_sail.svg`} className="h-[80%] m-6" />
                <p id="smart-glow" className="font-semibold whitespace-nowrap text-[2.8vw]" > {strings["title"]} </p>
            </div>
            <button id="smart-glow" className="font-semibold order-last text-[1.8vw] mx-[3vw] hover:text-slate-500/50 hover:bg-white hover:rounded-3xl"
            style={{padding: "5px 20px"}}>{strings['login']}</button>
        </div>
    )
}

export default GuestHeader