import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { CreateBlockStage, Database, db } from "../CreateBlock";


interface ChooseTableProps {
    selectedTable: string;
    setSelectedTable: (table: string) => void;
    selectedProperties: Database;
    setSelectedProperties: React.Dispatch<React.SetStateAction<Database>>;
    handleNextStage: (newStage: CreateBlockStage, done: boolean) => void;
}

export default function ChooseTable({ selectedTable, setSelectedTable, selectedProperties, setSelectedProperties, handleNextStage }: ChooseTableProps){

    // changes checked state in selectedProperties
    const handlePropertyCheckboxChange = (property: string) => {
        setSelectedProperties(prevState => {
            const newState: Database = { ...prevState };

            if (newState[selectedTable] && newState[selectedTable][property]) {
                newState[selectedTable][property] = {
                    ...newState[selectedTable][property],
                    checked: !newState[selectedTable][property].checked
                };
            }
            return newState;
        });
    }; 
    
    const ChooseTableRow = ({ name, type, }: { name: string; type: string,  }) => {
        // need to import selectedProperties
        const isChecked = selectedProperties[selectedTable]?.[name]?.checked || false;
        return (
            <div className="border-b border-gray-300 last:border-b-0 flex flex-row items-center gap-4">
                <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={isChecked}
                    onChange={() => handlePropertyCheckboxChange(name)}
                />
                <p>{name}</p>
                <p className="ml-auto mr-2">{type}</p>
            </div>        
        );
    };
    
    const TableName = ({ name }: { name: string }) => {
        const handleOnClick = () => {
            if (selectedTable !== name) {
                setSelectedTable(name);
            }
        };
        return (
            <div className="text-black border-r last:border-r-0 border-r-black/60 pr-3 last:pr-3">
                <p className={`${selectedTable === name ? 'font-medium' : 'font-normal'}`} onClick={handleOnClick}>{name}</p>
            </div>
        );
    };

    return(
        <>
            <div className="border-b border-gray-300 p-2 flex justify-between items-center">
                <p>1. Choose <b>one</b> table and its properties</p>
                <ArrowRightCircleIcon
                    width={20}
                    height={20}
                    className="text-gray-700 cursor-pointer mr-2"
                    onClick={() => handleNextStage(CreateBlockStage.Stage2, false)}
                />
            </div>
            {/* List of tables to choose from */ }
            <div className="border-b border-gray-300 p-2 flex flex-row gap-2 overflow-x-scroll hide-scrollbar">
                {Object.keys(db).map((value) => {
                    return <TableName key={`item-${value}`} name={value} />;
                })}
            </div>
            {/* List of properties in the selected table to choose from */ }
            <div className="p-2 flex flex-col gap-2 overflow-y-scroll border-b-0">
                {Object.entries(db[selectedTable]).map(([property, { type }]) => (
                    <ChooseTableRow key={`tablerowitem-${property}`} name={property} type={type} />
                ))}
            </div>
        </>
    )
}