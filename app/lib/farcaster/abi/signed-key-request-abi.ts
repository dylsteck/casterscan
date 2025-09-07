export const signedKeyRequestAbi = [
  {
    components: [
      { name: "requestFid", type: "uint256" },
      { name: "requestSigner", type: "address" },
      { name: "signature", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    name: "SignedKeyRequest",
    type: "tuple",
  },
] as const;
