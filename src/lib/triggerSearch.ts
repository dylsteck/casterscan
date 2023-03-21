import { NextRouter } from "next/router";

export default function triggerSearch(input: string, router: NextRouter){
    router.push(`/hash/${input}`)
}