import { ReactNode } from "react";

interface GuestLayoutProps{
    children: ReactNode
}
const GuestLayout: React.FC<GuestLayoutProps> = ({children}) => {
    return(
        <div className="h-full w-full overflow-x-hidden overflow-y-auto max-w-screen">
            {children}
        </div>
    )
}
export default GuestLayout