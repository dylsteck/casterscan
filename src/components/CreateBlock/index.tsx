import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import ChooseTable from "./ChooseTable";
import ChooseFilters from "./ChooseFilters";

export const db: Database = {
    casts: {
        fname: { type: 'string', checked: true, filterType: '', filterValue: ''},
        fid: { type: 'string', checked: true, filterType: '', filterValue: ''},
        pfp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        embeds: { type: 'Array<any>', checked: true, filterType: '', filterValue: ''},
        hash: { type: 'string', checked: true, filterType: '', filterValue: ''},
        id: { type: 'string', checked: true, filterType: '', filterValue: ''},
        mentions: { type: 'Array<any>', checked: true, filterType: '', filterValue: ''},
        mentions_positions: { type: 'Array<any>', checked: true, filterType: '', filterValue: ''},
        parent_fid: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        parent_hash: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        parent_url: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        text: { type: 'string', checked: true, filterType: '', filterValue: ''},
        timestamp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
    },
    messages: {
        id: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        deleted_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        pruned_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        revoked_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        timestamp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        message_type: { type: 'number', checked: true, filterType: '', filterValue: ''},
        hash: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        hash_scheme: { type: 'number', checked: true, filterType: '', filterValue: ''},
        signature: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        signature_scheme: { type: 'number', checked: true, filterType: '', filterValue: ''},
        signer: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        raw: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
    },
    reactions: {
        id: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        deleted_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        timestamp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        reaction_type: { type: 'number', checked: true, filterType: '', filterValue: ''},
        hash: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        target_hash: { type: 'Buffer | null', checked: true, filterType: '', filterValue: ''},
        target_fid: { type: 'bigint | null', checked: true, filterType: '', filterValue: ''},
        target_url: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
    },
    verifications: {
        id: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        deleted_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        timestamp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        hash: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        claim: { type: 'object', checked: true, filterType: '', filterValue: ''},
    },
    signers: {
        id: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        deleted_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        timestamp: { type: 'string', checked: true, filterType: '', filterValue: ''},
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        hash: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        custody_address: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        signer: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        name: { type: 'string', checked: true, filterType: '', filterValue: ''},
    },
    fids: {
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        updated_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        custody_address: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
    },
    users: {
        fid: { type: 'bigint', checked: true, filterType: '', filterValue: ''},
        created_at: { type: 'string', checked: true, filterType: '', filterValue: ''},
        custody_address: { type: 'Buffer', checked: true, filterType: '', filterValue: ''},
        pfp: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        display: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        bio: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        url: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
        fname: { type: 'string | null', checked: true, filterType: '', filterValue: ''},
    },
};

export type Property = {
    type: string;
    checked: boolean;
    filterType: string;
    filterValue: string;
};

type Filter = {
    type: string;
    value: string;
};

type Table = {
    [key: string]: Property;
};

export type Database = {
    [key: string]: Table;
};

export enum CreateBlockStage {
    Stage1 = 1,
    Stage2 = 2
}

export default function CreateBlock() {
    const [selectedTable, setSelectedTable] = useState<string>('casts'); // table to filter from
    const [stage, setStage] = useState<CreateBlockStage>(CreateBlockStage.Stage1); // stage 1 or stage 2
    const [selectedProperties, setSelectedProperties] = useState<Database>(() => {
        const initialProperties: Database = {};

        Object.keys(db).forEach(table => {
            initialProperties[table] = {};

            Object.keys(db[table]).forEach(property => {
                initialProperties[table][property] = {
                    type: db[table][property].type,
                    checked: true,
                    filterType: '',
                    filterValue: ''
                };
            });
        });

        return initialProperties;
    }); // properties from the selected table

    useEffect(() => {
        console.log("Selected properties: ", selectedProperties);
    }, [selectedProperties]);   

    function generateSQLQuery(selectedTable: string, table: Table): string {
        const filters: Filter[] = [];
    
        for (const key in table) {
            const { checked, filterType, filterValue } = table[key];
    
            if (checked && filterType && filterValue) {
                filters.push({ type: filterType, value: filterValue, property: key });
            }
        }
    
        const whereConditions: string[] = filters.map(filter => {
            const { type, value, property } = filter;
            const propertyCondition =
                type === 'keyword'
                    ? `${property} = '${value}'`
                    : type && value
                    ? `${property} ${type} '${value}'`
                    : '';
    
            return propertyCondition;
        });
    
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
        const query = `SELECT * FROM ${JSON.stringify(selectedTable)} ${whereClause};`;
    
        return query;
    }
    
    
    
    const handleNextStage = (newStage: CreateBlockStage, done: boolean) => {
        if (done) {
            const currentTable = selectedProperties[selectedTable];
            if(currentTable){
                const sqlQuery = generateSQLQuery(selectedTable, currentTable);
                console.log(sqlQuery);
                // process sql query
            }
        } else if (stage !== newStage) {
            setStage(newStage);
        }
    }

    function renderCreateBlockBody() {
        if (stage === CreateBlockStage.Stage1) {
            return (
                <ChooseTable
                    selectedTable={selectedTable} 
                    setSelectedTable={setSelectedTable}
                    selectedProperties={selectedProperties}
                    setSelectedProperties={setSelectedProperties}
                    handleNextStage={handleNextStage}
                />
            );
        } else {
            return (
                <ChooseFilters
                    selectedTable={selectedTable} 
                    setSelectedTable={setSelectedTable}
                    selectedProperties={selectedProperties}
                    setSelectedProperties={setSelectedProperties}
                    handleNextStage={handleNextStage}
                />
            );
        }
    }

    return (
        <div className="border border-gray-300 w-[40vw] h-[30vh] overflow-y-scroll">
            {renderCreateBlockBody()}
        </div>
    )
}