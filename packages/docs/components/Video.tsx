import React from "react";

interface VideoProps {
  src: string;
  width?: string;
  height?: string;
  controls?: boolean;
}

const Video: React.FC<VideoProps> = ({
  src,
  width = "50%",
  height = "auto",
  controls = true,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <video width={width} height={height} controls={controls}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Video;
