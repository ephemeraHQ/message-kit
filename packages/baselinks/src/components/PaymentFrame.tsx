"use client";
import React from "react";
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

const PaymentFrame: React.FC<any> = ({ url, image, label }) => {
  const handleCoinbaseDeeplink = () => {
    const coinbasePaymentURL = url;
    window.location.href = coinbasePaymentURL;
  };

  return (
    <div className={`container ${geistSans.variable} ${geistMono.variable}`}>
      <div className="wrapper">
        <div className="form-container">
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <img src={image} alt="Payment Frame" style={{ width: "100%" }} />
            <div className="flex flex-col gap-2">
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
                {label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFrame;
