import ResponseData from ".";

export default function NeynarApiResponseData({ neynarCast }: { neynarCast: unknown }) {
    return <ResponseData data={neynarCast} title="neynar api" />
}