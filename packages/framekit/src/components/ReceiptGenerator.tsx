"use client";
import { useState } from "react";
import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";

export default function ReceiptGenerator() {
  const [formData, setFormData] = useState({
    txLink:
      "https://sepolia.basescan.org/tx/0x2ec524f740c5831b16ca84053f9b6ae3e3923d3399d527113982e884a75e6bfa",
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
      networkLogo: formData.networkLogo,
      amount: formData.amount,
      networkName: formData.networkName,
      tokenName: formData.tokenName,
    });

    setGeneratedUrl(`${baseUrl}/receipt?${params.toString()}`);
  };

  return (
    <div className={`container ${geistSans.variable} ${geistMono.variable}`}>
      <div className="wrapper">
        <h1 className={`title ${geistSans.className}`}>
          Transaction Receipt Generator
        </h1>

        <div className="form-container">
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
              <label className="label">Network Logo URL</label>
              <input
                type="text"
                value={formData.networkLogo}
                onChange={(e) =>
                  setFormData({ ...formData, networkLogo: e.target.value })
                }
                className="input"
                placeholder="https://example.com/logo.png"
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

            <div className="form-group">
              <label className="label">Network Name</label>
              <select
                value={formData.networkName}
                onChange={(e) =>
                  setFormData({ ...formData, networkName: e.target.value })
                }
                className="select">
                <option value="Base">Base</option>
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Token Name</label>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) =>
                  setFormData({ ...formData, tokenName: e.target.value })
                }
                className="input"
                placeholder="USDC"
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

        <div
          className="powered-by"
          style={{
            marginTop: "3rem",
            width: "100%",
            marginBottom: "1rem",
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
}
