"use client";

import React, { useEffect, useState } from "react";
import { useUserWallets, Wallet } from "@dynamic-labs/sdk-react-core";
import TransferModal from "../TransferModal/TransferModal";

export interface NFTItem {
    id: string;
    image_url: string | null;
    metadata: {
      name: string;
      description: string | null;
    };
    token: {
      address: string;
      name: string | null;
      symbol: string | null;
    };
  }
  
  interface BlockscoutNFTResponse {
    items: NFTItem[];
  }
  
  export default function NFTGrid() {
    const userWallets = useUserWallets();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [nfts, setNfts] = useState<NFTItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
  
    // For modal handling
    const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  
    // Pick an EVM wallet from userWallets
    useEffect(() => {
      if (userWallets.length > 0) {
        setWallet(userWallets.find((w) => w.chain === "EVM") || null);
      }
    }, [userWallets]);
  
    // Fetch NFTs from Blockscout whenever we have an EVM wallet
    useEffect(() => {
      async function fetchNFTs() {
        if (!wallet) return;
  
        try {
          setLoading(true);
          const res = await fetch(
            `https://pegasus.lightlink.io/api/v2/addresses/${wallet.address}/nft?type=ERC-721`
          );
          if (!res.ok) {
            throw new Error(
              `Failed to fetch NFTs: ${res.status} ${res.statusText}`
            );
          }
          const data: BlockscoutNFTResponse = await res.json();
          setNfts(data.items || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchNFTs();
    }, [wallet]);
  
    // Click handler to open the modal for a specific NFT
    const handleOpenTransferModal = (nft: NFTItem) => {
      setSelectedNFT(nft);
    };
  
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-700">Loading NFTs...</p>
        </div>
      );
    }
  
    return (
      <div className="mx-auto max-w-7xl p-6">
        <TransferModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
          wallet={wallet}
        />
  
        {nfts.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">No NFTs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="flex flex-col rounded-md border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {nft.image_url ? (
                  <img
                    src={nft.image_url}
                    alt={nft.metadata?.name || `Token #${nft.id}`}
                    className="w-full h-auto mb-3 rounded"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded bg-gray-100 mb-3">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
  
                <h2 className="text-lg font-semibold mb-1">
                  {nft.metadata?.name || `Token #${nft.id}`}
                </h2>
                <p className="text-sm text-gray-700 mb-4 break-all">
                  Contract: {nft.token.address}
                </p>
  
                <button
                  onClick={() => handleOpenTransferModal(nft)}
                  className="mt-auto rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                >
                  Transfer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  