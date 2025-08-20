import { getHubCast } from '@/app/lib/server';
import ResponseData from '.';

export default async function NeynarHubResponseData({ fid, hash }: { fid: number, hash: string }) {
  const neynarHubCast = await getHubCast(fid, hash, 'neynar');
  return (
        <>
            <ResponseData data={neynarHubCast} title="neynar hub" />
        </>
  );
}
