import React from 'react';

export const ShimmerBox: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '16px', borderRadius = '6px', style }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #161b22 0%, #21262d 50%, #161b22 100%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
      ...style
    }}
  />
);

export const DashboardSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
    {/* Header Skeleton */}
    <div>
      <ShimmerBox width="280px" height="32px" borderRadius="8px" style={{ marginBottom: '8px' }} />
      <ShimmerBox width="420px" height="18px" borderRadius="6px" />
    </div>

    {/* Attention Cards Skeleton */}
    <div>
      <ShimmerBox width="140px" height="14px" style={{ marginBottom: '14px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <ShimmerBox width="90px" height="14px" />
            <ShimmerBox width="60px" height="28px" borderRadius="8px" />
            <ShimmerBox width="130px" height="12px" />
          </div>
        ))}
      </div>
    </div>

    {/* Actions Skeleton */}
    <div>
      <ShimmerBox width="130px" height="14px" style={{ marginBottom: '14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#1c2128',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <ShimmerBox width="18px" height="18px" borderRadius="4px" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <ShimmerBox width="65%" height="16px" />
                <ShimmerBox width="35%" height="12px" />
              </div>
            </div>
            <ShimmerBox width="110px" height="24px" borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ActionsSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
    <div>
      <ShimmerBox width="200px" height="30px" borderRadius="8px" style={{ marginBottom: '8px' }} />
      <ShimmerBox width="450px" height="16px" />
    </div>

    {/* Metric Badges */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '16px 20px' }}>
          <ShimmerBox width="80px" height="12px" style={{ marginBottom: '8px' }} />
          <ShimmerBox width="50px" height="28px" borderRadius="8px" style={{ marginBottom: '6px' }} />
          <ShimmerBox width="120px" height="12px" />
        </div>
      ))}
    </div>

    {/* Action Item Rows */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}
        >
          <ShimmerBox width="20px" height="20px" borderRadius="5px" style={{ marginTop: '2px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ShimmerBox width="75%" height="18px" />
            <ShimmerBox width="45%" height="13px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <ShimmerBox width="150px" height="22px" borderRadius="6px" />
              <ShimmerBox width="80px" height="14px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const MeetingsSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <div>
      <ShimmerBox width="220px" height="30px" borderRadius="8px" style={{ marginBottom: '8px' }} />
      <ShimmerBox width="480px" height="16px" />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '10px',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <ShimmerBox width="140px" height="12px" />
          <ShimmerBox width="60%" height="20px" />
          <ShimmerBox width="90%" height="14px" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <ShimmerBox width="260px" height="14px" />
            <ShimmerBox width="90px" height="26px" borderRadius="50px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DecisionsSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
    <div>
      <ShimmerBox width="200px" height="30px" borderRadius="8px" style={{ marginBottom: '8px' }} />
      <ShimmerBox width="450px" height="16px" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ShimmerBox width="80%" height="17px" />
            <ShimmerBox width="30%" height="13px" />
          </div>
          <ShimmerBox width="120px" height="26px" borderRadius="6px" />
        </div>
      ))}
    </div>
  </div>
);

export const QuestionsSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
    <div>
      <ShimmerBox width="200px" height="30px" borderRadius="8px" style={{ marginBottom: '8px' }} />
      <ShimmerBox width="450px" height="16px" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <ShimmerBox width="70%" height="17px" />
            <ShimmerBox width="40%" height="13px" />
          </div>
          <ShimmerBox width="120px" height="26px" borderRadius="6px" />
        </div>
      ))}
    </div>
  </div>
);

export const MeetingDetailSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: '24px 32px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '60%' }}>
        <ShimmerBox width="160px" height="14px" />
        <ShimmerBox width="100%" height="28px" borderRadius="8px" />
        <ShimmerBox width="280px" height="14px" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <ShimmerBox width="90px" height="32px" borderRadius="6px" />
        <ShimmerBox width="90px" height="32px" borderRadius="6px" />
      </div>
    </div>

    {/* Video Player Skeleton */}
    <ShimmerBox width="100%" height="240px" borderRadius="10px" />

    {/* Tabs Skeleton */}
    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
      <ShimmerBox width="90px" height="24px" borderRadius="4px" />
      <ShimmerBox width="90px" height="24px" borderRadius="4px" />
      <ShimmerBox width="90px" height="24px" borderRadius="4px" />
      <ShimmerBox width="90px" height="24px" borderRadius="4px" />
    </div>

    {/* Content Skeleton */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <ShimmerBox width="85%" height="16px" />
      <ShimmerBox width="95%" height="16px" />
      <ShimmerBox width="70%" height="16px" />
    </div>
  </div>
);

export const SearchSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
    <ShimmerBox width="140px" height="12px" style={{ marginBottom: '4px' }} />
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <ShimmerBox width="50%" height="15px" />
        <ShimmerBox width="90%" height="13px" />
        <ShimmerBox width="30%" height="11px" />
      </div>
    ))}
  </div>
);
