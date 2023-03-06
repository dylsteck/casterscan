import Layout from "@/components/Layout"
import { supabase } from "@/lib/supabase"
import { DocumentDuplicateIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"

export default function Home() {
  const [totalCasts, setTotalCasts] = useState(0)

  useEffect(() => {
    async function check(){
      const { count } = await supabase.from('casts').select('*', {count: 'exact'})
      setTotalCasts(count)
    }
    check()
  }, [totalCasts])

  return (
    <Layout>
      <div className="rounded-lg bg-white p-3 w-[50vw] h-[25vh] mx-auto mt-[25vh]">
        <div className="flex flex-row">
          <div className="ml-2 mt-2">
            <DocumentDuplicateIcon className="w-6 h-6 inline-block" />
            <h3 className="font-medium text-2xl inline-block ml-2">Total Casts</h3>
            <h3 className="font-regular text-lg ml-10">{totalCasts}</h3>
          </div>
          <div className="ml-5 mt-2">
            <DocumentDuplicateIcon className="w-6 h-6 inline-block" />
            <h3 className="font-medium text-2xl inline-block ml-2">Avg. Casts Per Day</h3>
            <h3 className="font-regular text-lg ml-10">2343</h3>
          </div>
        </div>
        <hr className="mt-3 mb-1" />
        <div className="flex flex-row mt-2">
          <div className="ml-2 mt-2">
            <DocumentDuplicateIcon className="w-6 h-6 inline-block" />
            <h3 className="font-medium text-2xl inline-block ml-2">Buying Power</h3>
            <h3 className="font-regular text-lg ml-10">{totalCasts}</h3>
          </div>
          <div className="ml-5 mt-2">
            <DocumentDuplicateIcon className="w-6 h-6 inline-block" />
            <h3 className="font-medium text-2xl inline-block ml-2">Last Cast</h3>
            <h3 className="font-regular text-lg ml-10">{totalCasts}</h3>
          </div>
        </div>
        {/* TODO: Insert graph here & turn flex children into component */}
      </div>
    </Layout>
  )
}
