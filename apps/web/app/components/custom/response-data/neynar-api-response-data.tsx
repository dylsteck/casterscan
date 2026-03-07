import ResponseData from ".";

export default function NeynarApiResponseData({ neynarCast }: { neynarCast: any }) {
    return <ResponseData data={neynarCast} title="neynar api" />
}