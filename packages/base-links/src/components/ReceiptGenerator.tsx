"use client";
import { useState } from "react";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";

export default function ReceiptGenerator() {
  const [formData, setFormData] = useState({
    txLink:
      "https://basescan.org/tx/0x2ec524f740c5831b16ca84053f9b6ae3e3923d3399d527113982e884a75e6bfa",
    networkLogo: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    amount: "1",
    networkName: "Base",
    tokenName: "usdc",
  });

  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = window.location.origin;

    // Create URLSearchParams object to properly encode parameters
    const params = new URLSearchParams({
      txLink: formData.txLink,
    });

    setGeneratedUrl(`${baseUrl}/receipt?txLink=${formData.txLink}`);
  };

  return (
    <div className="form-container">
      <h2 className={`title ${geistSans.className}`}>Receipts</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <div className="form-group">
          <label className="label">Transaction Link</label>
          <input
            type="text"
            value={formData.txLink}
            onChange={(e) =>
              setFormData({ ...formData, txLink: e.target.value })
            }
            className="input"
            placeholder="https://etherscan.io/tx/..."
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Amount</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="input"
            placeholder="1.0"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Generate Receipt URL
        </button>
      </form>

      {generatedUrl && (
        <div className="url-container">
          <label className="label">Generated Receipt URL</label>
          <div className="url-group">
            <input readOnly value={generatedUrl} className="input" />
            <button
              onClick={() => navigator.clipboard.writeText(generatedUrl)}
              className="copy-button">
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
