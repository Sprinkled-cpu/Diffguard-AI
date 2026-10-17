import React from 'react';

interface CRTEffectProps {
  enabled: boolean;
}

export const CRTEffect: React.FC<CRTEffectProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <>
      <div className="crt-overlay" />
      <div className="crt-vignette" />
    </>
  );
};

export default CRTEffect;
