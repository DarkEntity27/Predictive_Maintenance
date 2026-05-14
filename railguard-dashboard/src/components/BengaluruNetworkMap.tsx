import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Train } from 'lucide-react';

interface BengaluruNetworkMapProps {
  nodes: any[];
  edges: any[];
  blockedSegmentIds: number[];
  rerouteData?: any;
  onSegmentClick?: (segmentId: number) => void;
  selectedSegmentId?: number | null;
}

const CORRIDOR_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#eab308',
  3: '#3b82f6',
  4: '#22c55e',
  0: '#a855f7',
};

// Default corridor station paths (used when no reroute data)
const DEFAULT_CORRIDOR_PATHS: Record<number, string[]> = {
  1: ["Kengeri","R V College","Jnanabharathi","Nayandahalli","Chord Road","Krishnadevaraya","Jagjeevanram Nagar","Binnypet","KSR Bengaluru City","Cantonment","Bengaluru East","KR Puram","Hoodi","Whitefield"],
  2: ["Rajanukunte","Honnenahalli","Mudenahalli","Nagenahalli","Yelahanka","Judicial Layout","Kodigehalli","Hebbal","Yeshwantpur"],
  3: ["Nelamangala","Bethanagere","Honnasandra","Narasapura","Soladevanahalli","Chikkabanavara","Settihalli","Jalahalli","Lottegollahalli","Yeshwantpur"],
  4: ["Devanahalli","Doddajala","Chikkajala","Bettahalasur","Nitte Meenakshi","Jakkur East","Hegde Nagar","Thanisandra","Hennur","Horamavu","Channasandra","KR Puram","Baiyappanahalli","Belandur","Karmelaram","Huskur","Bommasandra","Heelalige"],
};

interface TrainAnim {
  id: string;
  corridorId: number;
  color: string;
  path: string[];           // station IDs in order
  pathIndex: number;        // current segment index
  progress: number;         // 0..1 within segment
  speed: number;            // progress per frame
  direction: 1 | -1;       // 1=forward, -1=reverse
  status: 'normal' | 'rerouted' | 'blocked';
  x: number;
  y: number;
  visible: boolean;
}

const BengaluruNetworkMap: React.FC<BengaluruNetworkMapProps> = ({
  nodes, edges, blockedSegmentIds, rerouteData, onSegmentClick, selectedSegmentId,
}) => {
  const nodeMap = useMemo(() => {
    const map: Record<string, any> = {};
    nodes.forEach((n) => (map[n.id] = n));
    return map;
  }, [nodes]);

  // Collect rerouted and active segment IDs
  const reroutedSegmentIds = useMemo(() => {
    const ids = new Set<number>();
    if (rerouteData?.corridor_results) {
      rerouteData.corridor_results.forEach((cr: any) => {
        if (cr.is_rerouted && cr.path_segments) {
          cr.path_segments.forEach((ps: any) => {
            if (ps.corridor !== cr.corridor_id) ids.add(ps.segment_id);
          });
        }
      });
    }
    return ids;
  }, [rerouteData]);

  const activePathSegments = useMemo(() => {
    const ids = new Set<number>();
    if (rerouteData?.corridor_results) {
      rerouteData.corridor_results.forEach((cr: any) => {
        if (cr.path_found && cr.path_segments) {
          cr.path_segments.forEach((ps: any) => ids.add(ps.segment_id));
        }
      });
    }
    return ids;
  }, [rerouteData]);

  const svgWidth = 820;
  const svgHeight = 700;
  const padding = 30;
  const scaleX = useCallback((x: number) => x * (svgWidth - padding * 2) / 760 + padding, []);
  const scaleY = useCallback((y: number) => y * (svgHeight - padding * 2) / 670 + padding, []);

  // ====== TRAIN ANIMATION ======
  const [trains, setTrains] = useState<TrainAnim[]>([]);
  const trainsRef = useRef<TrainAnim[]>([]);
  const rafRef = useRef<number>();

  // Build train paths based on reroute data or defaults
  const trainPaths = useMemo(() => {
    const paths: { corridorId: number; path: string[]; status: 'normal' | 'rerouted' | 'blocked' }[] = [];

    for (const cId of [1, 2, 3, 4]) {
      const cr = rerouteData?.corridor_results?.find((c: any) => c.corridor_id === cId);
      if (cr) {
        if (cr.path_found && cr.stations_involved?.length >= 2) {
          paths.push({
            corridorId: cId,
            path: cr.stations_involved,
            status: cr.is_rerouted ? 'rerouted' : 'normal',
          });
        } else {
          // Blocked — use default path but mark as blocked (train will stop)
          paths.push({ corridorId: cId, path: DEFAULT_CORRIDOR_PATHS[cId], status: 'blocked' });
        }
      } else {
        paths.push({ corridorId: cId, path: DEFAULT_CORRIDOR_PATHS[cId], status: 'normal' });
      }
    }
    return paths;
  }, [rerouteData]);

  // Initialize trains (2 per corridor — one each direction)
  useEffect(() => {
    const newTrains: TrainAnim[] = [];
    trainPaths.forEach((tp, idx) => {
      const startNode = nodeMap[tp.path[0]];
      const endNode = nodeMap[tp.path[tp.path.length - 1]];
      // Forward train
      newTrains.push({
        id: `t-${tp.corridorId}-fwd`,
        corridorId: tp.corridorId,
        color: tp.status === 'rerouted' ? '#f97316' : tp.status === 'blocked' ? '#ef4444' : CORRIDOR_COLORS[tp.corridorId],
        path: tp.path,
        pathIndex: 0,
        progress: 0,
        speed: tp.status === 'blocked' ? 0 : 0.008 + idx * 0.001,
        direction: 1,
        status: tp.status,
        x: startNode ? scaleX(startNode.x) : 0,
        y: startNode ? scaleY(startNode.y) : 0,
        visible: tp.status !== 'blocked',
      });
      // Reverse train (starts from end, offset)
      newTrains.push({
        id: `t-${tp.corridorId}-rev`,
        corridorId: tp.corridorId,
        color: tp.status === 'rerouted' ? '#f97316' : tp.status === 'blocked' ? '#ef4444' : CORRIDOR_COLORS[tp.corridorId],
        path: [...tp.path].reverse(),
        pathIndex: 0,
        progress: 0.5,  // offset
        speed: tp.status === 'blocked' ? 0 : 0.007 + idx * 0.001,
        direction: 1,
        status: tp.status,
        x: endNode ? scaleX(endNode.x) : 0,
        y: endNode ? scaleY(endNode.y) : 0,
        visible: tp.status !== 'blocked',
      });
    });
    trainsRef.current = newTrains;
    setTrains(newTrains);
  }, [trainPaths, nodeMap, scaleX, scaleY]);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime < 30) {  // ~33fps cap
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = time;

      const updated = trainsRef.current.map((train) => {
        if (train.speed === 0 || train.path.length < 2) return train;

        let newProgress = train.progress + train.speed;
        let newPathIndex = train.pathIndex;

        if (newProgress >= 1) {
          newProgress = 0;
          newPathIndex += 1;
          if (newPathIndex >= train.path.length - 1) {
            newPathIndex = 0; // loop
          }
        }

        const fromStation = train.path[newPathIndex];
        const toStation = train.path[newPathIndex + 1] || train.path[0];
        const fromNode = nodeMap[fromStation];
        const toNode = nodeMap[toStation];

        if (!fromNode || !toNode) return { ...train, pathIndex: 0, progress: 0 };

        // Ease function for smoother motion
        const ease = newProgress < 0.5
          ? 2 * newProgress * newProgress
          : 1 - Math.pow(-2 * newProgress + 2, 2) / 2;

        const x = scaleX(fromNode.x) + (scaleX(toNode.x) - scaleX(fromNode.x)) * ease;
        const y = scaleY(fromNode.y) + (scaleY(toNode.y) - scaleY(fromNode.y)) * ease;

        return { ...train, progress: newProgress, pathIndex: newPathIndex, x, y, visible: true };
      });

      trainsRef.current = updated;
      setTrains([...updated]);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [nodeMap, scaleX, scaleY]);

  // ====== STYLING HELPERS ======
  const getEdgeStyle = (edge: any) => {
    const isBlocked = blockedSegmentIds.includes(edge.segment_id);
    const isRerouted = reroutedSegmentIds.has(edge.segment_id);
    const isActive = activePathSegments.has(edge.segment_id);
    const isSelected = selectedSegmentId === edge.segment_id;

    if (isBlocked) return { stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '8,5', opacity: 0.7, cursor: 'pointer' };
    if (isRerouted) return { stroke: '#f97316', strokeWidth: 5, strokeDasharray: 'none', opacity: 1, cursor: 'pointer' };
    if (isSelected) return { stroke: '#60a5fa', strokeWidth: 5, strokeDasharray: 'none', opacity: 1, cursor: 'pointer' };

    const baseColor = CORRIDOR_COLORS[edge.corridor] || '#64748b';
    const isCrossover = edge.line_type === 'crossover';
    const hasRerouteData = rerouteData?.corridor_results;
    const dimmed = hasRerouteData && !isActive && !isCrossover;

    return {
      stroke: baseColor, strokeWidth: isCrossover ? 2 : 3,
      strokeDasharray: isCrossover ? '6,3' : 'none',
      opacity: dimmed ? 0.25 : (isCrossover ? 0.6 : 0.85), cursor: 'pointer',
    };
  };

  const getNodeStyle = (node: any) => {
    const isInterchange = node.is_interchange;
    const corridors = node.corridors || [];
    const primaryCorridor = corridors[0] || 1;
    const color = CORRIDOR_COLORS[primaryCorridor] || '#64748b';
    return {
      fill: isInterchange ? '#0f172a' : color,
      stroke: isInterchange ? '#f59e0b' : color,
      strokeWidth: isInterchange ? 2.5 : 1.5,
      r: isInterchange ? 8 : 5,
    };
  };

  const getMidpoint = (edge: any) => {
    const u = nodeMap[edge.source];
    const v = nodeMap[edge.target];
    if (!u || !v) return null;
    return { x: (scaleX(u.x) + scaleX(v.x)) / 2, y: (scaleY(u.y) + scaleY(v.y)) / 2 };
  };

  const getTrainGlow = (status: string) => {
    switch (status) {
      case 'rerouted': return 'rgba(249, 115, 22, 0.35)';
      case 'blocked': return 'rgba(239, 68, 68, 0.35)';
      default: return 'rgba(255, 255, 255, 0.15)';
    }
  };

  return (
    <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', overflow: 'auto' }}>
      <svg width="100%" height="700" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ minWidth: '700px' }}>
        <defs>
          <filter id="blr-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="blr-train-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge: any) => {
          const u = nodeMap[edge.source];
          const v = nodeMap[edge.target];
          if (!u || !v) return null;
          const style = getEdgeStyle(edge);
          const isBlocked = blockedSegmentIds.includes(edge.segment_id);
          const isRerouted = reroutedSegmentIds.has(edge.segment_id);
          const mid = getMidpoint(edge);

          return (
            <g key={`edge-${edge.segment_id}`}>
              <line x1={scaleX(u.x)} y1={scaleY(u.y)} x2={scaleX(v.x)} y2={scaleY(v.y)}
                stroke="transparent" strokeWidth="14" cursor="pointer"
                onClick={() => onSegmentClick?.(edge.segment_id)} />
              {isRerouted && (
                <line x1={scaleX(u.x)} y1={scaleY(u.y)} x2={scaleX(v.x)} y2={scaleY(v.y)}
                  stroke="#f97316" strokeWidth="10" opacity="0.15" filter="url(#blr-glow)" />
              )}
              <line x1={scaleX(u.x)} y1={scaleY(u.y)} x2={scaleX(v.x)} y2={scaleY(v.y)}
                stroke={style.stroke} strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray} opacity={style.opacity}
                cursor={style.cursor} strokeLinecap="round"
                onClick={() => onSegmentClick?.(edge.segment_id)} />
              {isBlocked && mid && (
                <g>
                  <circle cx={mid.x} cy={mid.y} r="10" fill="rgba(239, 68, 68, 0.2)" />
                  <line x1={mid.x-5} y1={mid.y-5} x2={mid.x+5} y2={mid.y+5}
                    stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1={mid.x+5} y1={mid.y-5} x2={mid.x-5} y2={mid.y+5}
                    stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}
              {mid && (
                <text x={mid.x} y={mid.y - 10} textAnchor="middle"
                  fill={isBlocked ? '#ef4444' : '#64748b'} fontSize="8"
                  fontWeight="600" opacity="0.7" pointerEvents="none">{edge.segment_id}</text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node: any) => {
          const style = getNodeStyle(node);
          const x = scaleX(node.x);
          const y = scaleY(node.y);
          return (
            <g key={`node-${node.id}`}>
              {node.is_interchange && (
                <circle cx={x} cy={y} r="14" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
              )}
              <circle cx={x} cy={y} r={style.r} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
              <text x={x} y={y - (node.is_interchange ? 16 : 10)} textAnchor="middle"
                fill={node.is_interchange ? '#fbbf24' : '#94a3b8'}
                fontSize={node.is_interchange ? '9' : '7.5'}
                fontWeight={node.is_interchange ? '700' : '500'}
                pointerEvents="none">{node.label}</text>
              {node.is_interchange && (
                <text x={x} y={y + 3.5} textAnchor="middle" fill="#fbbf24"
                  fontSize="7" fontWeight="800" pointerEvents="none">⬡</text>
              )}
            </g>
          );
        })}

        {/* Corridor terminal badges */}
        {[
          { name: 'Kengeri', corridor: 1 }, { name: 'Whitefield', corridor: 1 },
          { name: 'Rajanukunte', corridor: 2 }, { name: 'Nelamangala', corridor: 3 },
          { name: 'Devanahalli', corridor: 4 }, { name: 'Heelalige', corridor: 4 },
        ].map(({ name, corridor }) => {
          const node = nodeMap[name];
          if (!node) return null;
          const x = scaleX(node.x); const y = scaleY(node.y);
          return (
            <g key={`badge-${name}`}>
              <rect x={x-22} y={y+10} width="44" height="14" rx="7"
                fill={CORRIDOR_COLORS[corridor]} opacity="0.9" />
              <text x={x} y={y+20} textAnchor="middle" fill="white"
                fontSize="7" fontWeight="700">C-{corridor}</text>
            </g>
          );
        })}

        {/* ====== ANIMATED TRAINS ====== */}
        {trains.filter(t => t.visible).map((train) => (
          <g key={train.id} filter="url(#blr-train-glow)">
            {/* Glow circle */}
            <circle cx={train.x} cy={train.y} r="16" fill={getTrainGlow(train.status)} />
            {/* Train trail (fading tail) */}
            <circle cx={train.x} cy={train.y} r="10"
              fill="none" stroke={train.color} strokeWidth="1" opacity="0.4">
              <animate attributeName="r" from="10" to="22" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {/* Train icon container */}
            <g transform={`translate(${train.x - 10}, ${train.y - 10})`}>
              <Train size={20} color={train.color} strokeWidth={2.5} />
            </g>
            {/* Corridor label */}
            <text x={train.x} y={train.y - 18} textAnchor="middle"
              fill={train.color} fontSize="8" fontWeight="700" pointerEvents="none">
              C{train.corridorId}
            </text>
            {/* Status indicator for rerouted trains */}
            {train.status === 'rerouted' && (
              <text x={train.x} y={train.y + 26} textAnchor="middle"
                fill="#f97316" fontSize="7" fontWeight="600" pointerEvents="none">
                ↻ rerouted
              </text>
            )}
          </g>
        ))}

        {/* Blocked corridor indicators (stationary) */}
        {trains.filter(t => t.status === 'blocked' && !t.visible).length > 0 && (
          <>
            {trainPaths.filter(tp => tp.status === 'blocked').map((tp) => {
              // Show a stopped train at the last reachable station
              const midIdx = Math.floor(tp.path.length / 3);
              const station = tp.path[midIdx];
              const node = nodeMap[station];
              if (!node) return null;
              const x = scaleX(node.x); const y = scaleY(node.y);
              return (
                <g key={`blocked-train-${tp.corridorId}`}>
                  <circle cx={x} cy={y} r="14" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <g transform={`translate(${x-10}, ${y-10})`}>
                    <Train size={20} color="#ef4444" strokeWidth={2} />
                  </g>
                  <text x={x} y={y - 20} textAnchor="middle"
                    fill="#ef4444" fontSize="8" fontWeight="700">C{tp.corridorId} ✕</text>
                  <text x={x} y={y + 26} textAnchor="middle"
                    fill="#ef4444" fontSize="7" fontWeight="600" fontStyle="italic">stopped</text>
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="blr-legend">
        <div className="blr-legend-item">
          <span className="legend-line" style={{ background: '#ef4444' }}></span> Corridor 1
        </div>
        <div className="blr-legend-item">
          <span className="legend-line" style={{ background: '#eab308' }}></span> Corridor 2
        </div>
        <div className="blr-legend-item">
          <span className="legend-line" style={{ background: '#3b82f6' }}></span> Corridor 3
        </div>
        <div className="blr-legend-item">
          <span className="legend-line" style={{ background: '#22c55e' }}></span> Corridor 4
        </div>
        <div className="blr-legend-item">
          <span className="legend-line dashed" style={{ borderColor: '#a855f7' }}></span> Interchange
        </div>
        <div className="blr-legend-item">
          <span className="legend-line dashed" style={{ borderColor: '#ef4444' }}></span> Blocked
        </div>
        <div className="blr-legend-item">
          <span className="legend-line" style={{ background: '#f97316' }}></span> Rerouted
        </div>
        <div className="blr-legend-item" style={{ gap: '4px' }}>
          <Train size={12} color="#94a3b8" /> Train
        </div>
      </div>
    </div>
  );
};

export default BengaluruNetworkMap;
