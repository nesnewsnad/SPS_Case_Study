import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SPS Health — Pharmacy A Claims Analysis';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 30%, #99f6e4 60%, #5eead4 100%)',
        padding: '60px 80px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #0d9488, #0f766e, #115e59)',
        }}
      />

      {/* Title block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            fontWeight: 700,
            color: '#0f766e',
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
          }}
        >
          SPS Health
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 52,
            fontWeight: 800,
            color: '#134e4a',
            lineHeight: 1.1,
          }}
        >
          Pharmacy A Claims Analysis
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#115e59',
            opacity: 0.8,
            marginTop: 4,
          }}
        >
          Interactive dashboard for RFP evaluation — 2021 utilization data
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: 48,
          marginTop: 48,
          padding: '28px 36px',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 16,
          border: '1px solid rgba(13,148,136,0.2)',
        }}
      >
        {[
          { value: '546K', label: 'Claims' },
          { value: '5', label: 'States' },
          { value: '189', label: 'Groups' },
          { value: '5,610', label: 'Drugs' },
          { value: '4', label: 'Anomalies' },
        ].map((stat) => (
          <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0d9488' }}>{stat.value}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#115e59',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 32,
          right: 80,
          fontSize: 16,
          color: '#0f766e',
          opacity: 0.6,
        }}
      >
        Built by Dan Swensen — AI-assisted analytics
      </div>
    </div>,
    { ...size },
  );
}
