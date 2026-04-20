export function validateFid(fid: string | null): fid is string {
  return typeof fid === "string" && /^\d+$/.test(fid);
}

export function validateEventId(id: string | null): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id);
}

export function validateHash(hash: string | null): hash is string {
  return typeof hash === "string" && /^0x[a-fA-F0-9]+$/.test(hash);
}

export function validateSignerKey(signer: string | null): signer is string {
  return typeof signer === "string" && /^[a-zA-Z0-9+/=_-]+$/.test(signer) && signer.length <= 200;
}
