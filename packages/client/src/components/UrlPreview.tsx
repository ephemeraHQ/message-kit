import { useState, useEffect } from "react";
import styles from "./Chat.module.css";

interface OgData {
  image?: string;
  title?: string;
  description?: string;
  url?: string;
}

export const UrlPreview = ({
  url,
  urlType,
}: {
  url: string;
  urlType?: string;
}) => {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOGData = async () => {
      try {
        const decodedUrl = decodeURIComponent(url);
        console.log("Fetching OG data for URL:", decodedUrl);

        // Use the /api/og endpoint to avoid CORS
        const response = await fetch(
          `/api/og?url=${encodeURIComponent(decodedUrl)}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch OG data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Extracted OG data:", data);
        setOgData(data);
      } catch (error) {
        console.error("Error fetching OG data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchOGData();
    }
  }, [url]);

  if (loading) {
    return <div className={styles.loading}>Loading preview...</div>;
  }

  if (!ogData?.image) {
    return null;
  }

  return (
    <div className={styles.urlPreview}>
      <img
        src={ogData.image}
        alt={ogData.title || "Preview"}
        className={styles.previewImage}
      />
    </div>
  );
};
