import { PlusCircleIcon } from "@heroicons/react/24/solid"

// Todo: Change Page Header
export default function Dashboard(){

    const handleCreateBlock = () => {

    }

    return(
        <div className="p-10">
            <div className="flex flex-row gap-2 items-center">
                <PlusCircleIcon 
                    width={24} height={24} 
                    className="text-[#333333] cursor-pointer float-left" onClick={handleCreateBlock}
                />
                <p>CREATE BLOCK</p>
            </div>
        </div>
    )
}