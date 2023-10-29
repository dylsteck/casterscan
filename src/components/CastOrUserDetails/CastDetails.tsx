import Link from "next/link"
import { ExpandableImage } from "../ExpandableImage"
import CopyText from "../CopyText"
import { addHyperlinksToText } from "~/lib/text"
import { getRelativeTime } from "~/lib/time"

export default function CastDetails(cast: object | null){
    return(
    <div className="flex flex-col gap-1 pt-2">
        {cast !== null && 
            <div className="flex flex-row justify-between pl-2">
                <div className="flex flex-row gap-2 items-center float-left">
                  {cast?.pfp && 
                    <div className="w-[20px] h-[20px] flex items-center justify-center">
                      <ExpandableImage 
                        imageUrl={cast.pfp} 
                        rounded={true}
                      /> 
                    </div>
                  }
                  {cast.fname &&
                    <div className="pt-2 text-sm text-black/80 font-medium">
                        <Link href={`/users/${cast.fname}`}>
                            {`cast from ${cast.fname}`}
                        </Link>
                    </div>
                  }
                </div>
                <div className="float-right justify-between pt-2 pr-4">
                  {cast.timestamp && 
                    <p className="text-xs text-black/80 w-[100%] flex flex-row gap-1">
                      casted <CopyText text={getRelativeTime(cast.timestamp.getTime())} />
                    </p>
                  }
                </div>
            </div>
        }
        {cast && 
            <p className="text-black text-xl pt-4 pl-4 pb-4 md:pb-0">
                {addHyperlinksToText(cast.text)}
            </p>
        }
    </div>
  )
}