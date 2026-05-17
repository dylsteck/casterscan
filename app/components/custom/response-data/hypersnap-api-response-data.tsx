import ResponseData from ".";

export default function HypersnapApiResponseData({ hypersnapCast }: { hypersnapCast: unknown }) {
  return <ResponseData data={hypersnapCast} title="Hypersnap API" />;
}
