import type { NextRouter } from "next/router";

export default async function triggerSearch(input: string, router: NextRouter){
    await router.push(`/hash/${input}`);
}
