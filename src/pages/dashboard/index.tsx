import { PlusCircleIcon } from "@heroicons/react/24/solid"
import CreateBlock from "~/components/CreateBlock";

// Todo: Change Page Header
export default function Dashboard(){

    const handleCreateBlock = () => {
        console.log('creating block');
    }

    return(
        <div className="p-10">
            <div className="flex flex-row gap-2 items-center">
                <PlusCircleIcon 
                    width={24} height={24} 
                    className="text-[#333333] cursor-pointer float-left" onClick={handleCreateBlock}
                />
                <p>CREATE BLOCK</p>
                <CreateBlock />
            </div>
        </div>
    )
}