import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Share2, User, Calendar, MapPin, Clock, Check, Sparkles } from 'lucide-react';
import { EVENT_DETAILS, type Profile } from '../data/profiles';
import './OfficialInvitation.css';

interface OfficialInvitationProps {
  profile: Profile;
  className?: string;
  showActions?: boolean;
}

export const OfficialInvitation: React.FC<OfficialInvitationProps> = ({
  profile,
  className = '',
  showActions = true,
}) => {
  const isFreshers = (profile.eventType || profile.event) === 'freshers';
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // High-resolution template artwork with transparency cutout for the photo
  const templatePng = isFreshers
    ? '/templates/freshers-template.png'
    : '/templates/farewell-template.png';

  const templateJpg = isFreshers
    ? '/templates/freshers-template.jpg'
    : '/templates/farewell-template.jpg';

  useEffect(() => {
    // Fire celebratory confetti on view
    const colors = isFreshers
      ? ['#A855F7', '#C084FC', '#7C5CFF', '#FFFFFF', '#E879F9']
      : ['#C084FC', '#7C5CFF', '#F472B6', '#FFFFFF', '#A855F7'];

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.58 },
      colors,
      disableForReducedMotion: true,
    });
  }, [isFreshers]);

  const initials = profile.name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Official AHS Celebration 2026 Invitation`,
          text: `Personalized ${isFreshers ? 'Freshers Day' : 'Farewell Day'} 2026 invitation for ${profile.name}!`,
          url,
        });
      } catch {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // clipboard unavailable
      }
    }
  };

  // High quality client-side canvas poster rendering for 1-click photo download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      // Both templates are 682 x 1024
      const targetW = 682;
      const targetH = 1024;
      canvas.width = targetW;
      canvas.height = targetH;

      // 1. Dark background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, targetW, targetH);

      // 2. Photo slot parameters (Precise alignment to circular laurel aperture)
      const cx = 341.0;
      const cy = 352.0;
      const r = 128.0;

      // Load attendee photo if available
      if (profile.photo) {
        try {
          const photoImg = new Image();
          photoImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            photoImg.onload = () => resolve();
            photoImg.onerror = () => reject();
            photoImg.src = profile.photo!;
          });

          // Draw circular clipped photo focused towards upper-body
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Cover fit focusing at 20% from top
          const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight;
          const boxSize = (r + 2) * 2;
          let drawW = boxSize;
          let drawH = boxSize;
          let drawX = cx - r - 2;
          let drawY = cy - r - 2;

          if (imgAspect > 1) {
            drawW = boxSize * imgAspect;
            drawX = cx - drawW / 2;
          } else {
            drawH = boxSize / imgAspect;
            drawY = cy - r - 2 - (drawH - boxSize) * 0.20;
          }

          ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
          ctx.restore();
        } catch {
          // If external photo blocked by CORS, draw stylish fallback initials in circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = '#1c0a32';
          ctx.fill();
          ctx.fillStyle = '#C084FC';
          ctx.font = 'bold 56px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, cx, cy);
          ctx.restore();
        }
      }

      // 3. Draw Cutout Template PNG on top (ribbon, laurel ring, typography in front!)
      const tplImg = new Image();
      tplImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        tplImg.onload = () => resolve();
        tplImg.onerror = () => reject();
        tplImg.src = templatePng;
      });
      ctx.drawImage(tplImg, 0, 0, targetW, targetH);

      // 4. Draw attendee's name on the ribbon banner
      ctx.save();
      ctx.font = 'bold 36px "Great Vibes", "Dancing Script", "Alex Brush", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const ribbonY = 484;

      // Subtle metallic text shadow & stroke
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#210740';
      ctx.fillText(profile.name, cx, ribbonY);
      ctx.restore();

      // Convert to downloadable file
      canvas.toBlob((blob) => {
        if (!blob) {
          window.print();
          return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `AHS_${isFreshers ? 'Freshers' : 'Farewell'}_2026_${profile.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, 'image/png');
    } catch {
      // Fallback to print dialog
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`official-invitation-container ${isFreshers ? 'theme-freshers' : 'theme-farewell'} ${className}`}>
      {/* Action Toolbar */}
      {showActions && (
        <div className="invitation-action-toolbar no-print">
          <button
            type="button"
            className="toolbar-btn btn-download"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download high-resolution poster image"
          >
            <Download size={16} />
            <span>{isDownloading ? 'Generating Poster...' : 'Download Poster'}</span>
          </button>

          <button
            type="button"
            className="toolbar-btn btn-share"
            onClick={handleShare}
            title="Share invitation link"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Link Copied!' : 'Share Pass'}</span>
          </button>

          <button
            type="button"
            className="toolbar-btn btn-print"
            onClick={handlePrint}
            title="Print or Save as PDF"
          >
            <Sparkles size={16} />
            <span>Print / PDF</span>
          </button>
        </div>
      )}

      {/* Main Official Poster Card */}
      <div className="invitation-poster-card" ref={cardRef}>
        {/* Layer 1: Attendee Photo (Aligned inside the circular laurel wreath) */}
        <div className="invitation-photo-slot">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`${profile.name} portrait`}
              className="invitation-photo-img"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = '1';
                  target.src = `/photos/${profile.id.toLowerCase().replace(/[^a-z0-9_-]/g, '')}.jpg`;
                } else if (target.dataset.fallbackTried === '1') {
                  target.dataset.fallbackTried = '2';
                  target.src = `/images/${isFreshers ? 'freshers' : 'farewell'}/${profile.id.toLowerCase()}.jpg`;
                }
              }}
            />
          ) : (
            <div className="invitation-photo-empty">
              <span className="photo-initials">{initials}</span>
              <User size={32} className="photo-empty-icon" />
            </div>
          )}
        </div>

        {/* Layer 2: Official Cutout Template PNG (Front overlay with transparent photo aperture) */}
        <img
          src={templatePng}
          alt={`${isFreshers ? 'Freshers Day' : 'Farewell Day'} 2026 Official Invitation`}
          className="invitation-template-img"
          onError={(e) => {
            // Graceful fallback to JPG if PNG is unavailable
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = 'true';
              target.src = templateJpg;
            }
          }}
        />

        {/* Layer 3: Student Name (Elegantly aligned on the silk ribbon banner) */}
        <div className="invitation-ribbon-name" title={profile.name}>
          <span className="ribbon-text">{profile.name}</span>
        </div>
      </div>

      {/* Quick Event Summary Bar */}
      <div className="invitation-quick-meta no-print">
        <div className="meta-pill">
          <Calendar size={14} className="meta-icon" />
          <span>{EVENT_DETAILS.date || 'Nov 5, 2026'}</span>
        </div>
        <div className="meta-pill">
          <Clock size={14} className="meta-icon" />
          <span>{EVENT_DETAILS.time || '10:00 AM'}</span>
        </div>
        <div className="meta-pill">
          <MapPin size={14} className="meta-icon" />
          <span>{EVENT_DETAILS.venue || 'Near Boys Hostel'}</span>
        </div>
      </div>
    </div>
  );
};

export default OfficialInvitation;
