import React, { useEffect, useState } from 'react';
import { GraphData } from '../types';
import { Train } from 'lucide-react';

interface NetworkMapProps {
    data: GraphData;
    diversionPath: string[]; // List of station IDs
}

const NetworkMap: React.FC<NetworkMapProps> = ({ data, diversionPath }) => {
    const [trainPos, setTrainPos] = useState({ x: 0, y: 0 });
    const [pathIndex, setPathIndex] = useState(0);

    // Find node coordinates helper
    const getNode = (id: string) => data.nodes.find((n) => n.id === id);

    useEffect(() => {
        if (!diversionPath || diversionPath.length < 2) return;

        // Animation logic
        const animateTrain = () => {
            const startNode = getNode(diversionPath[pathIndex]);
            const endNode = getNode(diversionPath[pathIndex + 1]);

            if (!startNode || !endNode) return;

            const startTime = Date.now();
            const duration = 2000; // 2 seconds per segment

            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);

                const currentX = startNode.x + (endNode.x - startNode.x) * progress;
                const currentY = startNode.y + (endNode.y - startNode.y) * progress;

                setTrainPos({ x: currentX, y: currentY });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (pathIndex < diversionPath.length - 2) {
                        setPathIndex((prev) => prev + 1);
                    } else {
                        // Reset to start
                        setTimeout(() => setPathIndex(0), 1000);
                    }
                }
            };
            requestAnimationFrame(animate);
        };

        animateTrain();
    }, [pathIndex, diversionPath, data]);

    // Scale coordinates for SVG
    const scaleX = (val: number) => val * 1.8 + 50;
    const scaleY = (val: number) => val * 2 + 50;

    return (
        <div className="network-map-container" style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', overflow: 'hidden' }}>
            <svg width="100%" height="300" viewBox="0 0 900 300">
                {/* Edges */}
                {data.edges.map((edge, idx) => {
                    const u = getNode(edge.source);
                    const v = getNode(edge.target);
                    if (!u || !v) return null;

                    const isBlocked =
                        (edge.source === data.blocked_edge.source && edge.target === data.blocked_edge.target) ||
                        (edge.source === data.blocked_edge.target && edge.target === data.blocked_edge.source);

                    // Check if this edge is part of the diversion path
                    const isDiversion =
                        diversionPath.includes(edge.source) &&
                        diversionPath.includes(edge.target) &&
                        Math.abs(diversionPath.indexOf(edge.source) - diversionPath.indexOf(edge.target)) === 1;

                    return (
                        <line
                            key={idx}
                            x1={scaleX(u.x)}
                            y1={scaleY(u.y)}
                            x2={scaleX(v.x)}
                            y2={scaleY(v.y)}
                            stroke={isBlocked ? '#ef4444' : isDiversion ? '#10b981' : '#334155'}
                            strokeWidth={isDiversion ? 4 : 2}
                            strokeDasharray={isBlocked ? '5,5' : 'none'}
                        />
                    );
                })}

                {/* Nodes */}
                {data.nodes.map((node) => (
                    <g key={node.id}>
                        <circle cx={scaleX(node.x)} cy={scaleY(node.y)} r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                        <text
                            x={scaleX(node.x)}
                            y={scaleY(node.y) - 15}
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            {node.id.replace('Station_', '')}
                        </text>
                    </g>
                ))}

                {/* Train Animation */}
                <g transform={`translate(${scaleX(trainPos.x) - 12}, ${scaleY(trainPos.y) - 12})`}>
                    <circle cx="12" cy="12" r="16" fill="rgba(16, 185, 129, 0.2)" />
                    <Train size={24} color="#10b981" />
                </g>
            </svg>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#334155' }}></span> Normal Track
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '12px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#ef4444', borderStyle: 'dashed' }}></span> Blocked
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '12px' }}>
                    <span style={{ width: '12px', height: '4px', background: '#10b981' }}></span> Diversion Route
                </div>
            </div>
        </div>
    );
};

export default NetworkMap;
