import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import './QRCodeCard.css';

interface QRCodeCardProps {
  profileId: string;
  name: string;
  event: 'freshers' | 'farewell';
  size?: number;
  className?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  profileId,
  name,
  event,
  size = 170,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  // Compute full URL for QR code, normalizing any Vercel preview hash to the canonical public domain
  const getCleanOrigin = () => {
    if (typeof window === 'undefined') return '';
    const host = window.location.host;
    if (host.includes('vercel.app') && (host.includes('sibirajs-projects') || host.includes('-git-') || host.split('-').length > 2)) {
      return 'https://ahs-celebration.vercel.app';
    }
    return window.location.origin;
  };
  const profileUrl = `${getCleanOrigin()}/profile/${profileId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`qr-card ${event === 'freshers' ? 'qr-card--freshers' : 'qr-card--farewell'} ${className}`}>
      {/* HUD Frame crosshair corners */}
      <span className="qr-corner qr-corner--tl" />
      <span className="qr-corner qr-corner--tr" />
      <span className="qr-corner qr-corner--bl" />
      <span className="qr-corner qr-corner--br" />

      <div className="qr-card__inner">
        <div className="qr-wrapper">
          <QRCodeSVG
            value={profileUrl}
            size={size}
            level="H"
            includeMargin={true}
            bgColor="#050914"
            fgColor={event === 'freshers' ? '#42D9FF' : '#c084fc'}
            imageSettings={{
              src: '/vite.svg',
              height: 24,
              width: 24,
              excavate: true
            }}
          />
          <div className="qr-scanner-line" />
        </div>

        <div className="qr-details">
          <p className="qr-instruction">
            <QrCode size={16} className="qr-instruction__icon" />
            <span>Scan to Open Invitation</span>
          </p>
          <p className="qr-target-id">REF: {profileId}</p>

          <div className="qr-actions">
            <button
              type="button"
              onClick={handleCopyLink}
              className="qr-btn qr-btn--copy"
              title="Copy personalized invitation link"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`/profile/${profileId}`}
              className="qr-btn qr-btn--visit"
              title={`View ${name}'s direct invitation`}
            >
              <ExternalLink size={14} />
              <span>Direct Link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCard;
