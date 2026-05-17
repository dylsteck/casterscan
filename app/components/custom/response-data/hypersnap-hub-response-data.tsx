'use client';

import { useState } from "react";
import ResponseData from ".";
import { useHypersnapHubCast } from "../../../hooks/use-api-data";

export default function HypersnapHubResponseData({ fid, hash }: { fid: number; hash: string }) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, error } = useHypersnapHubCast(fid, hash, { enabled });

  const responseData = !enabled
    ? { idle: true }
    : isLoading
      ? { loading: true }
      : error
        ? { error: error.message }
        : data;

  return (
    <ResponseData
      data={responseData}
      title="Hypersnap hub"
      onOpen={() => setEnabled(true)}
    />
  );
}
