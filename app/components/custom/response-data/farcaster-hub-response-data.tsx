'use client';

import ResponseData from ".";
import { useFarcasterHubCast } from "../../../hooks/use-api-data";

export default function FarcasterHubResponseData({ fid, hash }: { fid: number, hash: string }) {
    const { data, isLoading, error } = useFarcasterHubCast(fid, hash);

    if (isLoading) {
        return <ResponseData data={{ loading: true }} title="farcaster hub" />;
    }

    if (error) {
        return <ResponseData data={{ error: error.message }} title="farcaster hub" />;
    }

    return <ResponseData data={data} title="farcaster hub" />;
} 