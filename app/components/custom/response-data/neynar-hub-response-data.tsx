'use client';

import ResponseData from ".";
import { useNeynarHubCast } from "../../../hooks/use-api-data";

export default function NeynarHubResponseData({ fid, hash }: { fid: number, hash: string }) {
    const { data, isLoading, error } = useNeynarHubCast(fid, hash);

    if (isLoading) {
        return <ResponseData data={{ loading: true }} title="neynar hub" />;
    }

    if (error) {
        return <ResponseData data={{ error: error.message }} title="neynar hub" />;
    }

    return <ResponseData data={data} title="neynar hub" />;
}