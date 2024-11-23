"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { parseUnits } from "viem";

import { GeistMono as geistMono } from "geist/font/mono";
import { GeistSans as geistSans } from "geist/font/sans";

export default function UrlGenerator({ params }: { params: any }) {
  const [formData, setFormData] = useState(params);

  const [generatedUrl, setGeneratedUrl] = useState("");

  const amountUint256 = parseUnits(formData.amount.toString(), 6);
  const ethereumUrl = `ethereum:${formData.tokenAddress}@${formData.chainId}/transfer?address=${formData.recipientAddress}&uint256=${amountUint256}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    const params = new URLSearchParams({
      recipientAddress: formData.recipientAddress,
      amount: formData.amount,
      chainId: formData.chainId,
    });

    setGeneratedUrl(`${baseUrl}?${params.toString()}`);
  };

  return (
    <div className={`container ${geistSans.variable} ${geistMono.variable}`}>
      <div className="wrapper">
        <h1 className={`title ${geistSans.className}`}>Payment Generator</h1>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-group">
            <div className="form-group">
              <label className="label">Recipient Address</label>
              <input
                type="text"
                value={formData.recipientAddress}
                onChange={(e) =>
                  setFormData({ ...formData, recipientAddress: e.target.value })
                }
                className="input"
                placeholder="0x..."
              />
            </div>

            <div className="form-group">
              <label className="label">Amount (USDC)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="input"
                placeholder="1.0"
              />
            </div>

            <div className="form-group">
              <label className="label">Network</label>
              <select
                value={formData.chainId}
                onChange={(e) =>
                  setFormData({ ...formData, chainId: e.target.value })
                }
                className="select"
              >
                <option value="8453">Base</option>
                <option value="1">Ethereum</option>
                <option value="137">Polygon</option>
              </select>
            </div>

            <button type="submit" className="submit-button">
              Generate Frame URL
            </button>
          </form>

          {generatedUrl && (
            <div className="url-container">
              <label className="label">Generated URL</label>
              <div
                style={{
                  backgroundColor: "yellow",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                This frame can be sent through Converse and includes a button
                that deeplinks to the wallet transaction. It only works on
                mobile devices and EVM wallets.
              </div>
              <div className="url-group">
                <input readOnly value={generatedUrl} className="input" />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedUrl)}
                  className="copy-button"
                >
                  Copy
                </button>
              </div>
              <div
                className="qr-code"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <QRCodeSVG value={ethereumUrl} size={128} />
              </div>
              <div
                style={{
                  backgroundColor: "yellow",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                }}
              >
                This QR works in Mobile, scan this qr code with your mobile
                camera
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
          }}
        >
          Powered by{" "}
          <a
            href="https://github.com/ephemeraHQ/message-kit"
            target="_blank"
            rel="noopener noreferrer"
          >
            MessageKit
          </a>
        </div>
      </div>
    </div>
  );
}
