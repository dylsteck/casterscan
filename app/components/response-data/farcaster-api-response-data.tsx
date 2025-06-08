'use client';

import ResponseData from ".";
import { useFarcasterCast } from "../../hooks/useApiData";

export default function FarcasterApiResponseData({ hash }: { hash: string }) {
    const { data, isLoading, error } = useFarcasterCast(hash);

    if (isLoading) {
        return <ResponseData data={{ loading: true }} title="farcaster api" />;
    }

    if (error) {
        return <ResponseData data={{ error: error.message }} title="farcaster api" />;
    }

    return <ResponseData data={data} title="farcaster api" />;
} 