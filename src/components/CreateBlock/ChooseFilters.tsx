import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { CreateBlockStage, Database, Property, db } from "../CreateBlock";
import { useEffect, useState } from "react";

interface ChooseFiltersProps {
    selectedTable: string;
    setSelectedTable: (table: string) => void;
    selectedProperties: Database;
    setSelectedProperties: React.Dispatch<React.SetStateAction<Database>>;
    handleNextStage: (newStage: CreateBlockStage, done: boolean) => void;
}

export default function ChooseFilters({
    selectedTable,
    setSelectedTable,
    selectedProperties,
    setSelectedProperties,
    handleNextStage
}: ChooseFiltersProps) {
    const handlePropertyFilterChange = (
        property: string,
        key: keyof Property,
        newValue: string
    ) => {
        setSelectedProperties((prevState) => {
            const newState: Database = { ...prevState };
            if (
                newState[selectedTable] &&
                newState[selectedTable][property] &&
                newState[selectedTable][property][key] !== newValue
            ) {
                const filterType = newState[selectedTable][property]['filterType'];
                if (filterType === '' && key === 'filterValue') {
                    // adds placeholder operator if none exists for the key
                    newState[selectedTable][property]['filterType'] = '>';
                }
    
                newState[selectedTable][property] = {
                    ...newState[selectedTable][property],
                    [key]: newValue
                };
            }
    
            return newState;
        });
    };
    
    

    const MatchOperators = ({
        type,
        selectedOperator: initialSelectedOperator,
        selectedValue,
        onOperatorChange,
        onValueChange
    }: {
        type: string;
        selectedOperator: string;
        selectedValue: string;
        onOperatorChange: (operator: string) => void;
        onValueChange: (value: string) => void;
    }) => {
        const [textInputValue, setTextInputValue] = useState(selectedValue);
        const [selectedOperator, setSelectedOperator] = useState(initialSelectedOperator);
        const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    
        useEffect(() => {
            setTextInputValue(selectedValue);
        }, [selectedValue]);
    
        const handleOperatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newOperator = event.target.value;
            setSelectedOperator(newOperator);
            onOperatorChange(newOperator);
        };
    
        const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setTextInputValue(newValue);
            if (typingTimeout !== null) {
                clearTimeout(typingTimeout);
            }
            const newTimeout = setTimeout(() => {
                onValueChange(newValue);
            }, 500);
    
            setTypingTimeout(newTimeout);
        };

        const renderOptions = () => {
            if (type.includes('string')) {
                return (
                    <>
                        <option value="keyword">{'keyword'}</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value="=">{'='}</option>
                        <option value=">=">{'>='}</option>
                        <option value="<=">{'<='}</option>
                        <option value="!=">{'!='}</option>
                    </>
                )
            } else {
                return (
                    <>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value="=">{'='}</option>
                        <option value=">=">{'>='}</option>
                        <option value="<=">{'<='}</option>
                        <option value="!=">{'!='}</option>
                    </>
                )
            }
        };

        return (
            <div className="flex items-center">
                <select
                    value={selectedOperator}
                    onChange={handleOperatorChange}
                    className="mr-2 px-2 py-1 border border-gray-300 rounded"
                >
                    {renderOptions()}
                </select>
                <input
                    type="text"
                    value={textInputValue}
                    onChange={handleValueChange}
                    className="px-2 py-1 border border-gray-300 rounded"
                />
            </div>
        );
    };
    
    const FilterTableRow = ({
        name,
        type,
        selectedOperator: initialSelectedOperator,
        selectedValue: initialValue,
        onOperatorChange,
        onValueChange
    }: {
        name: string;
        type: string;
        selectedOperator: string;
        selectedValue: string;
        onOperatorChange: (operator: string) => void;
        onValueChange: (value: string) => void;
    }) => {
        const [selectedOperator, setSelectedOperator] = useState(initialSelectedOperator);
        const [selectedValue, setSelectedValue] = useState(initialValue);

        const handleOperatorChange = (operator: string) => {
            setSelectedOperator(operator);
            onOperatorChange(operator);
        };

        const handleValueChange = (value: string) => {
            console.log("VALUE"), value;
            setSelectedValue(value);
            onValueChange(value);
        };

        return (
            <div className="border-b border-gray-300 last:border-b-0 flex flex-row items-center gap-4">
                <p>{name}</p>
                <MatchOperators
                    type={type}
                    selectedOperator={selectedOperator}
                    selectedValue={selectedValue}
                    onOperatorChange={handleOperatorChange}
                    onValueChange={handleValueChange}
                />
            </div>
        );
    };

    return (
        <>
            <div className="border-b border-gray-300 p-2 flex justify-between items-center">
                <div className="flex flex-row gap-2">
                    <ArrowLeftCircleIcon
                        width={20}
                        height={20}
                        className="text-gray-700 cursor-pointer ml-2"
                        onClick={() => handleNextStage(CreateBlockStage.Stage1, false)}
                    />
                    <p>2. Choose filters</p>
                </div>
                <ArrowRightCircleIcon
                    width={20}
                    height={20}
                    className="text-gray-700 cursor-pointer mr-2"
                    onClick={() => handleNextStage(CreateBlockStage.Stage2, true)}
                />
            </div>
            <div className="p-2 flex flex-col gap-2 overflow-y-scroll border-b-0">
                {Object.entries(db[selectedTable]).map(([property, { type }]) => (
                    <FilterTableRow
                        key={`filtertablerowitem-${property}`}
                        name={property}
                        type={type}
                        selectedOperator={selectedProperties[selectedTable]?.[property]?.filterType || '>'}
                        selectedValue={selectedProperties[selectedTable]?.[property]?.filterValue || ''}
                        onOperatorChange={(operator) =>
                            handlePropertyFilterChange(property, 'filterType', operator)
                        }
                        onValueChange={(value) =>
                            handlePropertyFilterChange(property, 'filterValue', value)
                        }
                    />
                ))}
            </div>
        </>
    );
}