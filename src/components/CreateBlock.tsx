import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";

const db: Database = {
    casts: {
        fname: { type: 'string', checked: true },
        fid: { type: 'string', checked: true },
        pfp: { type: 'string', checked: true },
        created_at: { type: 'string', checked: true },
        embeds: { type: 'Array<any>', checked: true },
        hash: { type: 'string', checked: true },
        id: { type: 'string', checked: true },
        mentions: { type: 'Array<any>', checked: true },
        mentions_positions: { type: 'Array<any>', checked: true },
        parent_fid: { type: 'string | null', checked: true },
        parent_hash: { type: 'string | null', checked: true },
        parent_url: { type: 'string | null', checked: true },
        text: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
    },
    messages: {
        id: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        deleted_at: { type: 'string', checked: true },
        pruned_at: { type: 'string', checked: true },
        revoked_at: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        fid: { type: 'bigint', checked: true },
        message_type: { type: 'number', checked: true },
        hash: { type: 'Buffer', checked: true },
        hash_scheme: { type: 'number', checked: true },
        signature: { type: 'Buffer', checked: true },
        signature_scheme: { type: 'number', checked: true },
        signer: { type: 'Buffer', checked: true },
        raw: { type: 'Buffer', checked: true },
    },
    reactions: {
        id: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        deleted_at: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        fid: { type: 'bigint', checked: true },
        reaction_type: { type: 'number', checked: true },
        hash: { type: 'Buffer', checked: true },
        target_hash: { type: 'Buffer | null', checked: true },
        target_fid: { type: 'bigint | null', checked: true },
        target_url: { type: 'string | null', checked: true },
    },
    verifications: {
        id: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        deleted_at: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        fid: { type: 'bigint', checked: true },
        hash: { type: 'Buffer', checked: true },
        claim: { type: 'object', checked: true },
    },
    signers: {
        id: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        deleted_at: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        fid: { type: 'bigint', checked: true },
        hash: { type: 'Buffer', checked: true },
        custody_address: { type: 'Buffer', checked: true },
        signer: { type: 'Buffer', checked: true },
        name: { type: 'string', checked: true },
    },
    user_data: {
        id: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        deleted_at: { type: 'string', checked: true },
        timestamp: { type: 'string', checked: true },
        fid: { type: 'bigint', checked: true },
        hash: { type: 'Buffer', checked: true },
        type: { type: 'UserDataType', checked: true },
        value: { type: 'string', checked: true },
    },
    fids: {
        fid: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        updated_at: { type: 'string', checked: true },
        custody_address: { type: 'Buffer', checked: true },
    },
    users: {
        fid: { type: 'bigint', checked: true },
        created_at: { type: 'string', checked: true },
        custody_address: { type: 'Buffer', checked: true },
        pfp: { type: 'string | null', checked: true },
        display: { type: 'string | null', checked: true },
        bio: { type: 'string | null', checked: true },
        url: { type: 'string | null', checked: true },
        fname: { type: 'string | null', checked: true },
    },
};

type Property = {
    type: string;
    checked: boolean;
};

type Table = {
    [key: string]: Property;
};

type Database = {
    [key: string]: Table;
};

enum CreateBlockStage {
    Stage1 = 1,
    Stage2 = 2
}

export default function CreateBlock() {
    const [selectedTable, setSelectedTable] = useState<string>('casts');
    const [stage, setStage] = useState<CreateBlockStage>(CreateBlockStage.Stage1);
    const [selectedProperties, setSelectedProperties] = useState<Database>(() => {
        const initialProperties: Database = {};
        
        Object.keys(db).forEach(table => {
            initialProperties[table] = {};
            
            Object.keys(db[table]).forEach(property => {
                initialProperties[table][property] = {
                    type: db[table][property].type,
                    checked: true
                };
            });
        });

        return initialProperties;
    });

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

    const TableSelector = ({ name }: { name: string }) => {
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

    const TableRow = ({ name, type }: { name: string; type: string }) => {
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

    const FilterTableRow = ({ name, type }: { name: string; type: string; }) => {
        // rethink this a little bit, finish rest of site first
        return (
            <div className="border-b border-gray-300 last:border-b-0 flex flex-row items-center gap-4">
            <p>{name}</p>
            {/* <p className="ml-auto mr-2">{type}</p> */}
            <MatchOperators type={type} />
            {/* <input
                type="text"
                className="ml-auto mr-2"
                value={}
                onChange={() => handlePropertyCheckboxChange(name)}
            /> */}
            {/* Math Operator Dropdown */}
            {/* Value Input */}
            {/* note: and/or btw all em?? */}
        </div>        
        );
    };

    const MatchOperators = ({ type }: { type: string }) => {
        const [selectedOperator, setSelectedOperator] = useState('>');
        const [textInputValue, setTextInputValue] = useState('');
      
        const handleOperatorChange = (event: any) => {
          setSelectedOperator(event.target.value);
        };
      
        const handleTextInputChange = (event: any) => {
          setTextInputValue(event.target.value);
        };

        // TODO: when move on, make sure number operators arent strings
        // eg >= value has to have number, not string
        // fine for keyword though

        const renderOptions = () => {
            if(type.includes('string')){
                return(
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
            }
            else{
                return(
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
        }
      
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
              onChange={handleTextInputChange}
              className="px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        );
      };

    const handleNextStage = (newStage: CreateBlockStage, done: boolean) => {
        if(done){
            
        }
        else if(stage !== newStage){
            setStage(newStage);
        }
    }

    function renderCreateBlockBody(){
        if(stage === CreateBlockStage.Stage1){
            return (
                <>
                    <div className="border-b border-gray-300 p-2 flex justify-between items-center">
                        <p>1. Choose <b>one</b> table and its properties</p>
                        <ArrowRightCircleIcon width={20} height={20} className="text-gray-700 cursor-pointer mr-2" onClick={() => handleNextStage(CreateBlockStage.Stage2, false)} />
                    </div>
                    <div className="border-b border-gray-300 p-2 flex flex-row gap-2 overflow-x-scroll hide-scrollbar">
                        {Object.keys(db).map((value) => {
                            return <TableSelector key={`item-${value}`} name={value} />;
                        })}
                    </div>
                    <div className="p-2 flex flex-col gap-2 overflow-y-scroll border-b-0">
                        {Object.entries(db[selectedTable]).map(([property, { type }]) => (
                            <TableRow key={`tablerowitem-${property}`} name={property} type={type} />
                        ))}
                    </div>
                </>
            );
    }
    // ideas: channels table, and easier way to make queries
    // or describe all the blocks
    else{
        return (
            <>
                <div className="border-b border-gray-300 p-2 flex justify-between items-center">
                    <div className="flex flex-row gap-2">
                        <ArrowLeftCircleIcon width={20} height={20} className="text-gray-700 cursor-pointer ml-2" onClick={() => handleNextStage(CreateBlockStage.Stage1, false)} />
                        <p>2. Choose filters</p>
                    </div>
                    <ArrowRightCircleIcon width={20} height={20} className="text-gray-700 cursor-pointer mr-2" onClick={() => handleNextStage(CreateBlockStage.Stage2, true)} />
                </div>
                {/* <div className="border-b border-gray-300 p-2 flex flex-row gap-2 overflow-x-scroll hide-scrollbar">
                    {Object.keys(db).map((value) => {
                        return <TableSelector key={`item-${value}`} name={value} />;
                    })}
                </div> wanna show these */}
                <div className="p-2 flex flex-col gap-2 overflow-y-scroll border-b-0">
                    {Object.entries(db[selectedTable]).map(([property, { type }]) => (
                        <FilterTableRow key={`filtertablerowitem-${property}`} name={property} type={type} />
                    ))}
                </div>
            </>
        );
    }
  }

    return(
        <div className="border border-gray-300 w-[40vw] h-[30vh] overflow-y-scroll">
            {renderCreateBlockBody()}
        </div>
    )
}