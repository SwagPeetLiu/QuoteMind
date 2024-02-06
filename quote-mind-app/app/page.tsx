'use client'
import { useEffect, useState } from "react";
import GuestHeader from "@/components/overall_layout/GuestHeader";
import { useAppContext } from "@/providers/AppContextProviders";

// landing of the home page: either displays the welcome page of authenticated or unauthenticated layout
export default function Home() {

  // import global settings for string references:
  const strings = useAppContext().strings

  //Handling authentication
  const [auth, setAuth] = useState(false)

  // correspondingly display the content for guest home page and the user home page
  return (
    <>
      {auth ? (
        <div> {strings["welcome"]}</div>
      ) : (
        <div className="w-full h-full text-[var(--white)]">
          <div className="absolute top-0 w-[100%] h-[100%] overflow-x-hidden z-[-1]">
            <video autoPlay muted loop id="firstVideo" className="min-w-[100%] min-h-[100%] object-cover">
              <source src="/videos/sea.mp4" type="video/mp4" />
            </video>
          </div>
          <GuestHeader />
          <p>{strings["title"]}</p>
        </div>
      )}
    </>
  );
}
