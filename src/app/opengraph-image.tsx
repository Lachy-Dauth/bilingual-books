import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #8c5214 0%, #5e3a0d 100%)',
          color: '#ffeacb',
          fontFamily: 'serif',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 40, marginTop: 20, opacity: 0.92 }}>
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 56,
            fontSize: 30,
            opacity: 0.8,
          }}
        >
          <span>English</span>
          <span>·</span>
          <span>Français</span>
          <span>·</span>
          <span>Español</span>
          <span>·</span>
          <span>Deutsch</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
