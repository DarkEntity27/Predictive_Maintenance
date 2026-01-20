import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Train } from 'lucide-react';

interface NetworkMapProps {
    data: any; // Extended GraphData with Mumbai-specific fields
    diversionPath?: string[]; // List of station IDs
    isMumbaiCaseStudy?: boolean;
}

interface TrainState {
    id: string;
    service_number: string;
    status: string;
    path: string[];
    speed: number;
    delay_min: number | null;
    start_offset: number;
    note?: string;
    currentPosition: { x: number; y: number };
    pathIndex: number;
    isVisible: boolean;
    segmentStartTime: number;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ data, diversionPath = [], isMumbaiCaseStudy = false }) => {
    const [trains, setTrains] = useState<TrainState[]>([]);
    const trainsRef = useRef<TrainState[]>([]);
    const requestRef = useRef<number>();
    const lastUpdateRef = useRef<number>(0);

    // Single train state for non-Mumbai mode
    const [singleTrainPos, setSingleTrainPos] = useState({ x: 0, y: 0 });
    const [singleTrainPathIndex, setSingleTrainPathIndex] = useState(0);

    // Find node coordinates helper
    const getNode = useCallback((id: string) => {
        return data.nodes?.find((n: any) => n.id === id);
    }, [data.nodes]);

    // Initialize trains from train_simulation data
    useEffect(() => {
        if (!isMumbaiCaseStudy || !data.train_simulation?.trains) {
            setTrains([]);
            return;
        }

        const now = Date.now();
        const initialTrains: TrainState[] = data.train_simulation.trains.map((t: any) => {
            const startNode = getNode(t.path[0]);
            return {
                ...t,
                currentPosition: startNode || { x: 0, y: 0 },
                pathIndex: 0,
                isVisible: false,
                segmentStartTime: now + (t.start_offset * 1000)
            };
        });

        setTrains(initialTrains);
        trainsRef.current = initialTrains;
    }, [isMumbaiCaseStudy, data.train_simulation, getNode]);

    // Single Animation Loop
    const animate = useCallback((time: number) => {
        const now = Date.now();
        let needsUpdate = false;

        const nextTrains = trainsRef.current.map(train => {
            if (train.status === 'cancelled') return train;

            // Handle start delay
            if (now < train.segmentStartTime) {
                return train;
            }

            if (!train.isVisible) {
                needsUpdate = true;
                return { ...train, isVisible: true, segmentStartTime: now };
            }

            const currentIndex = train.pathIndex;
            if (currentIndex >= train.path.length - 1) {
                // Loop back to start after a pause
                if (now > train.segmentStartTime + 2000) {
                    needsUpdate = true;
                    const startNode = getNode(train.path[0]);
                    return {
                        ...train,
                        pathIndex: 0,
                        currentPosition: startNode || { x: 0, y: 0 },
                        segmentStartTime: now
                    };
                }
                return train;
            }

            const startNode = getNode(train.path[currentIndex]);
            const endNode = getNode(train.path[currentIndex + 1]);

            if (!startNode || !endNode) {
                needsUpdate = true;
                return { ...train, pathIndex: train.pathIndex + 1, segmentStartTime: now };
            }

            const baseDuration = 2000; // Base: 2 seconds per segment
            const duration = baseDuration / (train.speed || 0.5);
            const elapsed = now - train.segmentStartTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startNode.x + (endNode.x - startNode.x) * progress;
            const currentY = startNode.y + (endNode.y - startNode.y) * progress;

            if (progress >= 1) {
                needsUpdate = true;
                return {
                    ...train,
                    pathIndex: train.pathIndex + 1,
                    currentPosition: { x: endNode.x, y: endNode.y },
                    segmentStartTime: now
                };
            }

            needsUpdate = true;
            return {
                ...train,
                currentPosition: { x: currentX, y: currentY }
            };
        });

        if (needsUpdate) {
            trainsRef.current = nextTrains;
            // Only update state if enough time has passed to maintain 60fps
            // and avoid overwhelming React with too many updates
            setTrains([...nextTrains]);
        }

        requestRef.current = requestAnimationFrame(animate);
    }, [getNode]);

    // Single train animation for non-Mumbai mode
    useEffect(() => {
        if (isMumbaiCaseStudy || !diversionPath || diversionPath.length < 2) return;

        let animationFrameId: number;
        const animateSingleTrain = () => {
            const startNode = getNode(diversionPath[singleTrainPathIndex]);
            const endNode = getNode(diversionPath[singleTrainPathIndex + 1]);

            if (!startNode || !endNode) return;

            const startTime = Date.now();
            const duration = 2000;

            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);

                const currentX = startNode.x + (endNode.x - startNode.x) * progress;
                const currentY = startNode.y + (endNode.y - startNode.y) * progress;

                setSingleTrainPos({ x: currentX, y: currentY });

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    setSingleTrainPathIndex((prev) => {
                        if (prev + 1 >= diversionPath.length - 1) {
                            setTimeout(() => setSingleTrainPathIndex(0), 1000);
                            return prev;
                        }
                        return prev + 1;
                    });
                }
            };

            animationFrameId = requestAnimationFrame(animate);
        };

        animateSingleTrain();
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [singleTrainPathIndex, diversionPath, isMumbaiCaseStudy, getNode]);

    useEffect(() => {
        if (isMumbaiCaseStudy && trainsRef.current.length > 0) {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isMumbaiCaseStudy, animate]);

    // Scale coordinates for SVG
    const scaleX = (val: number) => isMumbaiCaseStudy ? val * 0.95 + 30 : val * 1.8 + 50;
    const scaleY = (val: number) => isMumbaiCaseStudy ? val * 1.5 + 30 : val * 2 + 50;

    // Get edge styling based on type
    const getEdgeStyle = (edge: any) => {
        const lineType = edge.line_type || 'normal';
        const isBlocked = edge.is_blocked ||
            (data.blocked_edge &&
                ((edge.source === data.blocked_edge.source && edge.target === data.blocked_edge.target) ||
                    (edge.source === data.blocked_edge.target && edge.target === data.blocked_edge.source))) ||
            (data.blocked_edges && data.blocked_edges.some((be: any) =>
                (edge.source === be.source && edge.target === be.target) ||
                (edge.source === be.target && edge.target === be.source)
            ));

        const safeDiversionPath = diversionPath || [];
        const isDiversion =
            safeDiversionPath.includes(edge.source) &&
            safeDiversionPath.includes(edge.target) &&
            Math.abs(safeDiversionPath.indexOf(edge.source) - safeDiversionPath.indexOf(edge.target)) === 1;

        if (isBlocked) {
            return { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '8,4' };
        }
        if (isDiversion) {
            return { stroke: '#f97316', strokeWidth: 4, strokeDasharray: 'none' };
        }
        if (lineType === 'fast') {
            return { stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: 'none' };
        }
        if (lineType === 'slow') {
            return { stroke: '#10b981', strokeWidth: 2.5, strokeDasharray: 'none' };
        }
        if (lineType === 'crossover') {
            return { stroke: '#fbbf24', strokeWidth: 2, strokeDasharray: '4,2' };
        }
        return { stroke: '#334155', strokeWidth: 2, strokeDasharray: 'none' };
    };

    // Get node styling based on type
    const getNodeStyle = (node: any) => {
        const lineType = node.line_type || 'normal';
        const label = node.label || node.id.replace('Station_', '').replace('_Slow', '').replace('_Fast', '');

        if (lineType === 'fast') {
            return { fill: '#1e40af', stroke: '#3b82f6', r: 7, label, badge: 'F' };
        }
        if (lineType === 'slow') {
            return { fill: '#065f46', stroke: '#10b981', r: 6, label, badge: 'S' };
        }
        return { fill: '#1e293b', stroke: '#94a3b8', r: 8, label, badge: null };
    };

    // Check if station is skipped
    const isSkippedStation = (nodeId: string) => {
        if (!data.skipped_stations) return false;
        const label = nodeId.replace('_Slow', '').replace('_Fast', '');
        return data.skipped_stations.some((s: string) => label.includes(s));
    };

    // Get train color based on status
    const getTrainColor = (status: string) => {
        switch (status) {
            case 'normal': return '#10b981';
            case 'delayed': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'diverted': return '#a855f7';
            case 'congested': return '#fbbf24';
            default: return '#94a3b8';
        }
    };

    const getTrainGlowColor = (status: string) => {
        switch (status) {
            case 'normal': return 'rgba(16, 185, 129, 0.3)';
            case 'delayed': return 'rgba(245, 158, 11, 0.3)';
            case 'cancelled': return 'rgba(239, 68, 68, 0.3)';
            case 'diverted': return 'rgba(168, 85, 247, 0.3)';
            case 'congested': return 'rgba(251, 191, 36, 0.3)';
            default: return 'rgba(148, 163, 184, 0.3)';
        }
    };

    return (
        <div className="network-map-container" style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
            <svg
                width="100%"
                height={isMumbaiCaseStudy ? "400" : "300"}
                viewBox={isMumbaiCaseStudy ? "0 0 1600 400" : "0 0 900 300"}
                style={{ minWidth: isMumbaiCaseStudy ? '1400px' : 'auto' }}
            >
                {/* Edges */}
                {data.edges?.map((edge: any, idx: number) => {
                    const u = getNode(edge.source);
                    const v = getNode(edge.target);
                    if (!u || !v) return null;

                    const style = getEdgeStyle(edge);

                    return (
                        <line
                            key={idx}
                            x1={scaleX(u.x)}
                            y1={scaleY(u.y)}
                            x2={scaleX(v.x)}
                            y2={scaleY(v.y)}
                            stroke={style.stroke}
                            strokeWidth={style.strokeWidth}
                            strokeDasharray={style.strokeDasharray}
                            opacity={edge.is_blocked ? 0.6 : 1}
                        />
                    );
                })}

                {/* Nodes */}
                {data.nodes?.map((node: any) => {
                    const style = getNodeStyle(node);
                    const isSkipped = isSkippedStation(node.id);

                    return (
                        <g key={node.id} opacity={isSkipped ? 0.4 : 1}>
                            <circle
                                cx={scaleX(node.x)}
                                cy={scaleY(node.y)}
                                r={style.r}
                                fill={style.fill}
                                stroke={style.stroke}
                                strokeWidth="2"
                            />
                            {style.badge && (
                                <text
                                    x={scaleX(node.x)}
                                    y={scaleY(node.y) + 4}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize="9"
                                    fontWeight="bold"
                                >
                                    {style.badge}
                                </text>
                            )}
                            <text
                                x={scaleX(node.x)}
                                y={scaleY(node.y) - (isMumbaiCaseStudy ? 18 : 15)}
                                textAnchor="middle"
                                fill={isSkipped ? '#64748b' : '#cbd5e1'}
                                fontSize={isMumbaiCaseStudy ? "10" : "12"}
                                fontWeight="600"
                            >
                                {style.label}
                            </text>
                            {isSkipped && (
                                <text
                                    x={scaleX(node.x)}
                                    y={scaleY(node.y) + 25}
                                    textAnchor="middle"
                                    fill="#ef4444"
                                    fontSize="8"
                                    fontStyle="italic"
                                >
                                    (skipped)
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Multiple Trains Animation */}
                {isMumbaiCaseStudy && trains.map((train) => (
                    <g key={train.id} opacity={train.isVisible ? (train.status === 'cancelled' ? 0.5 : 1) : 0}>
                        <circle
                            cx={scaleX(train.currentPosition.x)}
                            cy={scaleY(train.currentPosition.y)}
                            r="20"
                            fill={getTrainGlowColor(train.status)}
                        />
                        <g transform={`translate(${scaleX(train.currentPosition.x) - 12}, ${scaleY(train.currentPosition.y) - 12})`}>
                            <Train
                                size={24}
                                color={getTrainColor(train.status)}
                                strokeWidth={train.status === 'diverted' ? 3 : 2}
                            />
                        </g>
                        <text
                            x={scaleX(train.currentPosition.x)}
                            y={scaleY(train.currentPosition.y) - 28}
                            textAnchor="middle"
                            fill={getTrainColor(train.status)}
                            fontSize="9"
                            fontWeight="bold"
                        >
                            {train.service_number}
                        </text>
                        {train.delay_min && (
                            <text
                                x={scaleX(train.currentPosition.x)}
                                y={scaleY(train.currentPosition.y) + 35}
                                textAnchor="middle"
                                fill="#f59e0b"
                                fontSize="8"
                                fontWeight="600"
                            >
                                +{train.delay_min} min
                            </text>
                        )}
                    </g>
                ))}

                {!isMumbaiCaseStudy && diversionPath.length > 0 && (
                    <g>
                        <circle
                            cx={scaleX(singleTrainPos.x)}
                            cy={scaleY(singleTrainPos.y)}
                            r="16"
                            fill="rgba(249, 115, 22, 0.2)"
                        />
                        <g transform={`translate(${scaleX(singleTrainPos.x) - 12}, ${scaleY(singleTrainPos.y) - 12})`}>
                            <Train size={24} color="#f97316" />
                        </g>
                    </g>
                )}
            </svg>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                {isMumbaiCaseStudy ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '11px' }}>
                            <span style={{ width: '16px', height: '2.5px', background: '#10b981' }}></span> Slow Line
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6', fontSize: '11px' }}>
                            <span style={{ width: '16px', height: '3px', background: '#3b82f6' }}></span> Fast Line
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontSize: '11px' }}>
                            <span style={{ width: '16px', height: '2px', background: '#fbbf24', borderStyle: 'dashed' }}></span> Crossover
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '11px' }}>
                            <span style={{ width: '16px', height: '3px', background: '#ef4444', borderStyle: 'dashed' }}></span> Blocked
                        </div>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(148, 163, 184, 0.3)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <Train size={14} color="#10b981" /> <span style={{ color: '#94a3b8' }}>Normal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <Train size={14} color="#f59e0b" /> <span style={{ color: '#94a3b8' }}>Delayed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <Train size={14} color="#a855f7" /> <span style={{ color: '#94a3b8' }}>Diverted</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <Train size={14} color="#fbbf24" /> <span style={{ color: '#94a3b8' }}>Congested</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                            <Train size={14} color="#ef4444" /> <span style={{ color: '#94a3b8' }}>Cancelled</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' }}>
                            <span style={{ width: '12px', height: '2px', background: '#334155' }}></span> Normal Track
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '12px' }}>
                            <span style={{ width: '12px', height: '2px', background: '#ef4444', borderStyle: 'dashed' }}></span> Blocked
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '12px' }}>
                            <span style={{ width: '12px', height: '4px', background: '#10b981' }}></span> Diversion Route
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NetworkMap;
