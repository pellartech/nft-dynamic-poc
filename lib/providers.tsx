"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { config } from "@/lib/wagmi";

const evmNetworks = [
  {
    blockExplorerUrls: ["https://pegasus.lightlink.io/"],
    chainId: 1891,
    chainName: "LightLink Pegasus",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/lightlink.svg"],
    name: "LightLink Pegasus",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
      iconUrl: "https://app.dynamic.xyz/assets/networks/eth.svg",
    },
    networkId: 1891,
    rpcUrls: ["https://replicator.pegasus.lightlink.io/rpc/v1"],
    vanityName: "LightLink Pegasus",
    type: 'legacy'
  },
];

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: "99f97b9c-181c-4d2f-8c6d-cec43a63b072",
        walletConnectors: [EthereumWalletConnectors],
        overrides: { evmNetworks },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
