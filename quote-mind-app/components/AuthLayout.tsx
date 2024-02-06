import Header from "./overall_layout/Header"
import LeftSection from "./overall_layout/LeftSection"
import RightSection from "./overall_layout/RightSection"
import MainContainer from "./overall_layout/MainContainer"
import { ReactNode } from "react"

interface AuthLayoutProps{
    children: ReactNode
}
const AuthLayout: React.FC<AuthLayoutProps> = ({children}) => {
    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden">
            <Header />
            <div className="flex flex-row w-full h-[75%]">
                <LeftSection />
                <MainContainer> {children} </MainContainer>
                <RightSection />
            </div>
            <div id="footer" className="flex flex-row items-center w-full h-[10%] justify-between bg-yellow-500"></div>
        </div>
    )
}

export default AuthLayout