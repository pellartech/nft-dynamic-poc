"use client";

import React, { useEffect, useState } from "react";
import {
  useUserWallets,
  Wallet,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { NFTItem } from "../MyAssets/MyAssets";

// Minimal ERC721 ABI for transferring tokens
const ERC721_ABI = [
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function TransferModal({
  nft,
  wallet,
  onClose,
}: {
  nft: NFTItem | null;
  wallet: Wallet | null;
  onClose: () => void;
}) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [transferSuccess, setTransferSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();

  useEffect(() => {
    console.log("User wallets: ", userWallets);
  }, [userWallets]);

  // Don’t render modal if no NFT is selected
  if (!nft) return null;

  const handleConfirmTransfer = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      alert("No valid Ethereum wallet found.");
      return;
    }
    if (!wallet?.address) {
      alert("No valid wallet address found.");
      return;
    }
    if (!recipientAddress) {
      alert("Please enter a recipient address.");
      return;
    }

    try {
      setIsTransferring(true);

      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();

      const hash = await walletClient.writeContract({
        address: nft.token.address as `0x${string}`,
        abi: ERC721_ABI,
        functionName: "safeTransferFrom",
        args: [wallet.address, recipientAddress, parseInt(nft.id)],
        type: "legacy",
      });

      console.log("Transaction Hash: ", hash);
      setTxHash(hash);

      // Wait 3s, then confirm the transaction with a receipt check
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log("Transaction Receipt: ", receipt);

      setTransferSuccess(true);
    } catch (error: unknown) {
      console.error(error);
      alert(`Transfer error: ${(error as Error)?.message ?? "Unknown error"}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCloseModal = () => {
    // If you want to reset state on close, do it here
    setTransferSuccess(false);
    setTxHash(null);
    setRecipientAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCloseModal}
      ></div>

      {/* Modal content */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6 m-4">
        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold">
          Transfer {nft.metadata?.name ?? `Token #${nft.id}`}
        </h2>

        <div className="space-y-1 text-gray-700 text-sm">
          <p>
            <span className="font-medium">Contract:</span> {nft.token.address}
          </p>
          <p>
            <span className="font-medium">Token ID:</span> {nft.id}
          </p>
        </div>

        {/* If transfer succeeded, show success message & explorer link */}
        {transferSuccess && txHash ? (
          <div className="space-y-3">
            <p className="font-semibold text-green-600">
              Transfer successful!
            </p>
            <p className="text-sm text-gray-700">
              Your token has been transferred. You can view the transaction on
              the explorer:
            </p>
            <a
              href={`https://pegasus.lightlink.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 underline break-all"
            >
              {txHash}
            </a>
            <div className="pt-2">
              <button
                onClick={handleCloseModal}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          // Else show the input form
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            <button
              onClick={handleConfirmTransfer}
              disabled={isTransferring}
              className="self-start rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isTransferring ? "Transferring..." : "Confirm Transfer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
