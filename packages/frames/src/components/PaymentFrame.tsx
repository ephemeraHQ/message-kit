"use client";
import React from "react";
import { ethers } from "ethers";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      selectedAddress: string;
    };
  }
}

interface PaymentFrameProps {
  params: {
    url: string | undefined;
    recipientAddress: string;
    tokenAddress: string;
    amount: number;
    baseLogo: string;
    onRampURL: string;
    chainId?: number;
    networkName?: string;
    tokenName?: string;
  };
  ethereumUrl: string;
  amountUint256: string;
  image: string;
}

const PaymentFrame: React.FC<PaymentFrameProps> = ({
  params,
  ethereumUrl,
  amountUint256,
  image,
}) => {
  const BASE_CHAIN_ID = 8453;

  const handleWeb3Payment = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Ensure we're on Base network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
        });

        // Create transaction parameters for USDC transfer with gasless transaction
        const transactionParameters = {
          to: params.tokenAddress, // USDC contract address
          from: window.ethereum.selectedAddress,
          data: generateERC20TransferData(
            params.recipientAddress,
            amountUint256,
          ),
          maxFeePerGas: "0x0", // Set to 0 for gasless
          maxPriorityFeePerGas: "0x0", // Set to 0 for gasless
          // Add Base Paymaster contract as the gas sponsor
          gasPrice: "0x0",
        };

        // Send the transaction
        await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        });
      } catch (error) {
        console.error("Payment failed:", error);
      }
    } else {
      window.location.href = ethereumUrl;
    }
  };

  const handleCoinbaseDeeplink = () => {
    const coinbasePaymentURL = ethereumUrl;
    window.location.href = coinbasePaymentURL;
  };

  // Helper function to generate ERC20 transfer data
  function generateERC20TransferData(recipient: string, amount: string) {
    // ERC20 transfer function signature
    const transferFunctionSignature = "0xa9059cbb";

    // Pad address and amount to 32 bytes
    const paddedAddress = recipient.slice(2).padStart(64, "0");
    const paddedAmount = ethers.toBeHex(amount).slice(2).padStart(64, "0");

    return `${transferFunctionSignature}${paddedAddress}${paddedAmount}`;
  }

  return (
    <div className={`container ${geistSans.variable} ${geistMono.variable}`}>
      <div className="wrapper">
        <div className="form-container">
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <img src={image} alt="Payment Frame" style={{ width: "100%" }} />
            <div className="flex flex-col gap-2">
              {/* <button onClick={handleWeb3Payment} className="submit-button">
                Pay with Web3 Wallet
              </button> */}
              <button
                onClick={handleCoinbaseDeeplink}
                className="submit-button"
                style={{
                  backgroundColor: "#0052FF",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  padding: "1rem 2rem",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}>
                Pay in USDC
              </button>
            </div>
          </div>
        </div>
        <div
          className="powered-by"
          style={{
            marginTop: "3rem",
            width: "100%",
            marginBottom: "1rem",
            color: "var(--foreground)",
          }}>
          Powered by{" "}
          <a
            href="https://github.com/ephemeraHQ/message-kit"
            target="_blank"
            rel="noopener noreferrer">
            MessageKit
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFrame;
