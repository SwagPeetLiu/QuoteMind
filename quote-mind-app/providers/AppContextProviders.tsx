'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// setting up the interface to for language context properties
interface AppContextType {
    currentLan: string;
    strings: Record<string, string>;
    languageUpdate: (lan: string) => void;
  }

const AppContext = createContext<AppContextType | undefined>(undefined)

// to allow client side to access the global configurations
export function useAppContext(){
    const context = useContext(AppContext)
    if (context === undefined){
        throw new Error("global configuration is still not initialised")
    }
    return context
}

// context provider
export const AppContextProvider: React.FC<{children: ReactNode}> = ({children}) => {
    
    // initialise the current language settings as English:
    const [currentLan, setCurrentLan] = useState<string>("undefined")
    const [strings, setStrings] = useState<Record<string,string>>({"lan":"undefined"})

    // retrieve the corresponding file:
    const fetchLanguageStrings = async (currentLan: string) => {
        try{
            const response = await fetch(`../languages/${currentLan}.json`)
            const data = await response.json()
            setStrings(data)
            setCurrentLan(currentLan)
            console.log(`Language is now configured to ${currentLan}`)
        }
        catch(error){
            console.error("Error on fetching language strings: ", error)
        }
    }

    // function used to update the language settings:
    const languageUpdate = (currentLan: string) => {
        fetchLanguageStrings(currentLan)
    }

    // call the strings function when the components mounts:
    useEffect(()=>{
        console.log(`initialise language to English`)
        const defaultLan = "en"
        fetchLanguageStrings(defaultLan)

        
    },[])

    const initialValue = {
        currentLan,
        strings,
        languageUpdate
    }
    return (
        <AppContext.Provider value={initialValue}>
            {children}
        </AppContext.Provider>
    )
}