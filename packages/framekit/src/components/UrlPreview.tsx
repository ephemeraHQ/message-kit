import { useState, useEffect } from "react";
import styles from "./Chat.module.css";

interface OgData {
  image?: string;
  title?: string;
  description?: string;
}

export function UrlPreview({ url, urlType }: { url: string; urlType: string }) {
  const [ogData, setOgData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOgData = async (url: string) => {
    try {
      console.log("Fetching OG data for URL:", url);
      const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`);
      console.log("OG Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("OG Data received:", data);
      return data;
    } catch (error) {
      console.error("Error fetching OG data:", error);
      return null;
    }
  };

  useEffect(() => {
    if (url) {
      setLoading(true);
      fetchOgData(url).then((data) => {
        if (data) {
          setOgData(data);
        }
        setLoading(false);
      });
    }
  }, [url]);

  // Don't render anything while loading or if no image is available
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
}
