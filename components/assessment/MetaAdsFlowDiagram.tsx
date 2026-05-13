'use client';

export default function MetaAdsFlowDiagram() {
  const lineColor = '#333333';
  const textColor = '#d4d4d4';
  const subColor = '#606060';

  const crX = 295, crW = 155, crH = 24;

  const c1 = [
    { y: 28,  label: 'Pain Point Angles' },
    { y: 58,  label: 'Price Anchoring' },
    { y: 88,  label: 'Social Proof' },
    { y: 118, label: 'Info / Education' },
  ];
  const c2 = [
    { y: 152, label: 'Website Visitors' },
    { y: 182, label: 'Engaged Audiences' },
    { y: 212, label: 'Past Patients 90d' },
  ];

  const c1Centers = c1.map(c => c.y + crH / 2);   // [40, 70, 100, 130]
  const c2Centers = c2.map(c => c.y + crH / 2);   // [164, 194, 224]

  const cboCx = 55, cboCy = 122, cboDx = 45, cboDy = 24;
  const asDx = 55, asDy = 28;
  const as1Cx = 185, as1Cy = 72;
  const as2Cx = 185, as2Cy = 172;
  const branchX = 125;
  const crBranchX = 278;

  return (
    <div style={{ width: '100%', overflowX: 'auto', marginBottom: '4px' }}>
      <svg
        viewBox="0 0 465 244"
        width="100%"
        aria-label="Meta Ads Campaign Structure"
        style={{ display: 'block' }}
      >
        {/* ── Column headers ── */}
        <text x={cboCx} y={14} textAnchor="middle" fill={subColor} fontSize="7.5" letterSpacing="1.5" fontFamily="Space Grotesk, sans-serif">CAMPAIGN</text>
        <text x={as1Cx} y={14} textAnchor="middle" fill={subColor} fontSize="7.5" letterSpacing="1.5" fontFamily="Space Grotesk, sans-serif">AD SETS</text>
        <text x={crX + crW / 2} y={14} textAnchor="middle" fill={subColor} fontSize="7.5" letterSpacing="1.5" fontFamily="Space Grotesk, sans-serif">CREATIVES</text>

        {/* ── CBO → branch lines ── */}
        <line x1={cboCx + cboDx} y1={cboCy} x2={branchX} y2={cboCy} stroke={lineColor} strokeWidth="1.5" />
        <line x1={branchX} y1={as1Cy} x2={branchX} y2={as2Cy} stroke={lineColor} strokeWidth="1.5" />
        <line x1={branchX} y1={as1Cy} x2={as1Cx - asDx} y2={as1Cy} stroke={lineColor} strokeWidth="1.5" />
        <line x1={branchX} y1={as2Cy} x2={as2Cx - asDx} y2={as2Cy} stroke={lineColor} strokeWidth="1.5" />

        {/* ── Ad Set 1 → c1 creatives ── */}
        <line x1={as1Cx + asDx} y1={as1Cy} x2={crBranchX} y2={as1Cy} stroke={lineColor} strokeWidth="1.5" />
        <line x1={crBranchX} y1={c1Centers[0]} x2={crBranchX} y2={c1Centers[c1Centers.length - 1]} stroke={lineColor} strokeWidth="1.5" />
        {c1Centers.map((cy, i) => (
          <line key={`c1-${i}`} x1={crBranchX} y1={cy} x2={crX} y2={cy} stroke={lineColor} strokeWidth="1.5" />
        ))}

        {/* ── Ad Set 2 → c2 creatives ── */}
        <line x1={as2Cx + asDx} y1={as2Cy} x2={crBranchX} y2={as2Cy} stroke={lineColor} strokeWidth="1.5" />
        <line x1={crBranchX} y1={c2Centers[0]} x2={crBranchX} y2={c2Centers[c2Centers.length - 1]} stroke={lineColor} strokeWidth="1.5" />
        {c2Centers.map((cy, i) => (
          <line key={`c2-${i}`} x1={crBranchX} y1={cy} x2={crX} y2={cy} stroke={lineColor} strokeWidth="1.5" />
        ))}

        {/* ── CBO Diamond ── */}
        <polygon
          points={`${cboCx - cboDx},${cboCy} ${cboCx},${cboCy - cboDy} ${cboCx + cboDx},${cboCy} ${cboCx},${cboCy + cboDy}`}
          fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"
        />
        <text x={cboCx} y={cboCy - 4} textAnchor="middle" fill={textColor} fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">CBO</text>
        <text x={cboCx} y={cboCy + 9} textAnchor="middle" fill={subColor} fontSize="8" fontFamily="Space Grotesk, sans-serif">Campaign</text>

        {/* ── Ad Set 1 — Broad Testing ── */}
        <polygon
          points={`${as1Cx - asDx},${as1Cy} ${as1Cx},${as1Cy - asDy} ${as1Cx + asDx},${as1Cy} ${as1Cx},${as1Cy + asDy}`}
          fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5"
        />
        <text x={as1Cx} y={as1Cy - 6} textAnchor="middle" fill={textColor} fontSize="9.5" fontWeight="700" fontFamily="Space Grotesk, sans-serif">Broad Testing</text>
        <text x={as1Cx} y={as1Cy + 7} textAnchor="middle" fill={subColor} fontSize="8" fontFamily="Space Grotesk, sans-serif">Service A + B</text>

        {/* ── Ad Set 2 — Retargeting ── */}
        <polygon
          points={`${as2Cx - asDx},${as2Cy} ${as2Cx},${as2Cy - asDy} ${as2Cx + asDx},${as2Cy} ${as2Cx},${as2Cy + asDy}`}
          fill="rgba(212,168,71,0.1)" stroke="#D4A847" strokeWidth="1.5"
        />
        <text x={as2Cx} y={as2Cy - 6} textAnchor="middle" fill={textColor} fontSize="9.5" fontWeight="700" fontFamily="Space Grotesk, sans-serif">Retargeting</text>
        <text x={as2Cx} y={as2Cy + 7} textAnchor="middle" fill={subColor} fontSize="8" fontFamily="Space Grotesk, sans-serif">Warm Audiences</text>

        {/* ── Broad Testing creatives (purple) ── */}
        {c1.map((cr, i) => (
          <g key={`cr1-${i}`}>
            <rect x={crX} y={cr.y} width={crW} height={crH} rx="5" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.2" />
            <text x={crX + crW / 2} y={cr.y + crH / 2 + 4} textAnchor="middle" fill={textColor} fontSize="9.5" fontFamily="Space Grotesk, sans-serif">{cr.label}</text>
          </g>
        ))}

        {/* ── Retargeting creatives (gold) ── */}
        {c2.map((cr, i) => (
          <g key={`cr2-${i}`}>
            <rect x={crX} y={cr.y} width={crW} height={crH} rx="5" fill="rgba(212,168,71,0.1)" stroke="#D4A847" strokeWidth="1.2" />
            <text x={crX + crW / 2} y={cr.y + crH / 2 + 4} textAnchor="middle" fill={textColor} fontSize="9.5" fontFamily="Space Grotesk, sans-serif">{cr.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
