export const sourceRegistryAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "version", type: "string" },
      { indexed: true, internalType: "address", name: "submitter", type: "address" },
      { indexed: false, internalType: "string", name: "ipfsCID", type: "string" },
    ],
    name: "SourceSubmitted",
    type: "event",
  },
  {
    inputs: [],
    name: "getAllSources",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "version", type: "string" },
          { internalType: "string", name: "compiler", type: "string" },
          { internalType: "string", name: "license", type: "string" },
          { internalType: "string", name: "ipfsCID", type: "string" },
          { internalType: "address", name: "submitter", type: "address" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct SourceRegistry.Source[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_index", type: "uint256" }],
    name: "getSource",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "version", type: "string" },
          { internalType: "string", name: "compiler", type: "string" },
          { internalType: "string", name: "license", type: "string" },
          { internalType: "string", name: "ipfsCID", type: "string" },
          { internalType: "address", name: "submitter", type: "address" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct SourceRegistry.Source",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_version", type: "string" },
    ],
    name: "sourceExists",
    outputs: [{ internalType: "bool", name: "exists", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_version", type: "string" },
      { internalType: "string", name: "_compiler", type: "string" },
      { internalType: "string", name: "_license", type: "string" },
      { internalType: "string", name: "_ipfsCID", type: "string" },
    ],
    name: "submitSource",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSources",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
