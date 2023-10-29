import { useEffect, useState } from "react";
import CopyText from "../CopyText"
import { ExpandableImage } from "../ExpandableImage"
import CastDetails from "./CastDetails";


export default function CastOrUserDetails(hash?: string, username?: string){
    // need baseCast, currentCast and baseUser, currentUser
    // base represents casterscan data(need for details)
    // current represents currently selected(need for metadata)
    const [cast, setCast] = useState<object | null>(null);
    const [user, setUser] = useState<object | null>(null);
    const isCast = hash ? true : false; // if it's not a cast, it's a user

    useEffect(() => {
        if(isCast){
            // set casterscan cast
            // setCast
        } 
        else {
            // set casterscan user
            // setUser
        }   
    });

    return(
        <>
            <div className="flex-col md:flex-row gap-2 w-[100vw] h-auto md:h-[35vh]">
            <div className="flex flex-col gap-2 float-left overflow-y-scroll w-[100%] h-[100%] md:w-1/2 border-0 md:border-r-2 border-[#C1C1C1]">
                {isCast && <CastDetails cast={cast} /> }
            </div>
            {/* {!queryResult?.isLoading && queryResult.data?.cast &&
            <div className="float-right w-[100%] h-[40vh] md:h-[100%] overflow-y-scroll md:w-1/2 mt-2 border-t-2 border-[#C1C1C1] md:border-t-0">
              <p className="px-0 md:px-6 py-1 pl-5 md:pl-3 pt-3 md:pt-1 font-medium float-left text-sm text-black/80">metadata</p>
              <div className="float-right mr-[10%]">
                <div className="flex flex-row gap-1 py-1 items-center md:pl-0 pt-2 md:pt-0">
                  <div>
                    <p>source:</p>
                  </div>
                  <div>
                    <select className="mr-2" value={source} onChange={handleSourceChange}>
                    <option value="casterscan" selected>casterscan</option>
                    <option value="neynar">neynar</option>
                    <option value="hubs">hubs</option>
                  </select>
                  <button className="rounded-lg px-2 py-1 text-sm text-white bg-black">
                    <CopyText text="copy" value={JSON.stringify(queryResult?.data?.cast)} />
                  </button>
                  </div>
                </div> 
              </div>
              <table className="w-full text-sm text-left">
        <thead className="text-md text-[#494949] font-normal">
          <tr>
            <th scope="col" className="px-6 py-3 font-normal">
              key
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              value
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(sourceCast).length > 0 && Object.keys(sourceCast).map((value: string, index: number) => {
            return (
              <tr key={`${source}-property-${index}`}>
                <td className="px-6 py-3 font-normal">{value}</td>
                <td className="px-6 py-3 font-normal">{typeof sourceCast[value] === 'string' ? sourceCast[value] :  JSON.stringify(sourceCast[value])}</td>
              </tr>
            )
          })}
          <div id="bottom" />
        </tbody>
      </table>
            </div>
            } */}
          </div>
        </>
    )
};