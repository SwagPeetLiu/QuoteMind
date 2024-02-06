
interface ContainerProps{
    children: React.ReactNode
}

const MainContainer: React.FC<ContainerProps> = ({children}) => {
    return(
        <div className="p-4 w-[95%] h-full overflow-y-auto">{children}</div>
    )
}
export default MainContainer