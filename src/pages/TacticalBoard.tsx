import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface PlayerOnBoard {
  id: string;
  name: string;
  number: number;
  x: number;
  y: number;
  team: 'home' | 'away';
  color: string;
}

interface Arrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 560;

const TacticalBoard: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [boardPlayers, setBoardPlayers] = useState<PlayerOnBoard[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drawingArrow, setDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [currentArrow, setCurrentArrow] = useState<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<'move' | 'arrow' | 'erase'>('move');
  const [arrowColor, setArrowColor] = useState('#ff0000');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const animationRef = useRef<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    drawField();
  }, [boardPlayers, arrows, currentArrow, arrowStart]);

  const loadPlayers = async () => {
    try {
      const response = await api.get(`/api/v1/players/user/${user?.userId}`);
      setPlayers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo verde
    ctx.fillStyle = '#2d5a1b';
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    // Líneas del campo
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;

    // Borde
    ctx.strokeRect(40, 20, FIELD_WIDTH - 80, FIELD_HEIGHT - 40);

    // Línea del medio
    ctx.beginPath();
    ctx.moveTo(FIELD_WIDTH / 2, 20);
    ctx.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT - 20);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Punto central
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Área grande izquierda
    ctx.strokeRect(40, FIELD_HEIGHT / 2 - 100, 120, 200);
    // Área grande derecha
    ctx.strokeRect(FIELD_WIDTH - 160, FIELD_HEIGHT / 2 - 100, 120, 200);

    // Área chica izquierda
    ctx.strokeRect(40, FIELD_HEIGHT / 2 - 50, 55, 100);
    // Área chica derecha
    ctx.strokeRect(FIELD_WIDTH - 95, FIELD_HEIGHT / 2 - 50, 55, 100);

    // Arcos de penalti
    ctx.beginPath();
    ctx.arc(40 + 80, FIELD_HEIGHT / 2, 40, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH - 120, FIELD_HEIGHT / 2, 40, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3);
    ctx.stroke();

    // Puntos de penalti
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(40 + 80, FIELD_HEIGHT / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH - 120, FIELD_HEIGHT / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar flechas
    arrows.forEach(arrow => {
      drawArrow(ctx, arrow.startX, arrow.startY, arrow.endX, arrow.endY, arrow.color);
    });

    // Flecha en progreso
    if (arrowStart && currentArrow) {
      drawArrow(ctx, arrowStart.x, arrowStart.y, currentArrow.x, currentArrow.y, arrowColor);
    }

    // Dibujar jugadores
    boardPlayers.forEach(player => {
      // Sombra
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;

      // Círculo del jugador
      ctx.beginPath();
      ctx.arc(player.x, player.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = player.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Número
      ctx.fillStyle = 'white';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.number.toString(), player.x, player.y);

      // Nombre debajo
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(player.name.split(' ')[0], player.x, player.y + 32);
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cabeza de la flecha
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (FIELD_WIDTH / rect.width),
      y: (e.clientY - rect.top) * (FIELD_HEIGHT / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (tool === 'erase') {
      // Borrar flecha cercana
      setArrows(prev => prev.filter(arrow => {
        const dist = distToSegment(pos, { x: arrow.startX, y: arrow.startY }, { x: arrow.endX, y: arrow.endY });
        return dist > 15;
      }));
      return;
    }

    if (tool === 'arrow') {
      setArrowStart(pos);
      setDrawingArrow(true);
      return;
    }

    // Buscar jugador para arrastrar
    const player = boardPlayers.find(p => Math.hypot(p.x - pos.x, p.y - pos.y) < 25);
    if (player) {
      setDragging(player.id);
      dragOffset.current = { x: pos.x - player.x, y: pos.y - player.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);

    if (drawingArrow && arrowStart) {
      setCurrentArrow(pos);
      return;
    }

    if (dragging) {
      setBoardPlayers(prev => prev.map(p =>
        p.id === dragging
          ? { ...p, x: pos.x - dragOffset.current.x, y: pos.y - dragOffset.current.y }
          : p
      ));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingArrow && arrowStart && currentArrow) {
      const dist = Math.hypot(currentArrow.x - arrowStart.x, currentArrow.y - arrowStart.y);
      if (dist > 20) {
        setArrows(prev => [...prev, {
          id: Date.now().toString(),
          startX: arrowStart.x,
          startY: arrowStart.y,
          endX: currentArrow.x,
          endY: currentArrow.y,
          color: arrowColor,
        }]);
      }
      setDrawingArrow(false);
      setArrowStart(null);
      setCurrentArrow(null);
    }
    setDragging(null);
  };

  const distToSegment = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  };

  const addPlayerToBoard = (player: Player, team: 'home' | 'away') => {
    const alreadyOn = boardPlayers.find(p => p.id === player.id);
    if (alreadyOn) return;
    const x = team === 'home' ? 150 + Math.random() * 200 : 450 + Math.random() * 200;
    const y = 100 + Math.random() * 360;
    setBoardPlayers(prev => [...prev, {
      id: player.id,
      name: player.name,
      number: player.number,
      x, y,
      team,
      color: team === 'home' ? '#0066ff' : '#ff3333',
    }]);
  };

  const removePlayerFromBoard = (id: string) => {
    setBoardPlayers(prev => prev.filter(p => p.id !== id));
  };

  const clearBoard = () => {
    setBoardPlayers([]);
    setArrows([]);
  };

  const playAnimation = () => {
    if (arrows.length === 0) return;
    setIsPlaying(true);
    setAnimationStep(0);
    let step = 0;
    const animate = () => {
      step += 1;
      setAnimationStep(step);
      if (step < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
  };

  const toolBtnStyle = (active: boolean) => ({
    padding: '8px 16px',
    background: active ? '#00d4ff' : '#21262d',
    color: active ? '#0d1117' : 'white',
    border: '1px solid #30363d',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal' as any,
    fontSize: '13px',
  });

  return (
    <div style={{ padding: '24px', color: 'white', display: 'flex', gap: '24px', height: 'calc(100vh - 48px)' }}>
      {/* Panel izquierdo - Jugadores */}
      <div style={{ width: '200px', background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#8b949e' }}>JUGADORES</h3>
        {players.length === 0 && <p style={{ color: '#6b7280', fontSize: '12px' }}>No hay jugadores. Agrégalos en el módulo de Jugadores.</p>}
        {players.map(player => (
          <div key={player.id} style={{ marginBottom: '8px', padding: '10px', background: '#0d1117', borderRadius: '8px', border: '1px solid #21262d' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>#{player.number} {player.name}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>{player.position}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => addPlayerToBoard(player, 'home')}
                style={{ flex: 1, padding: '4px', background: '#0066ff', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>
                Local
              </button>
              <button onClick={() => addPlayerToBoard(player, 'away')}
                style={{ flex: 1, padding: '4px', background: '#ff3333', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '11px' }}>
                Visitante
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancha principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={toolBtnStyle(tool === 'move')} onClick={() => setTool('move')}>✋ Mover</button>
          <button style={toolBtnStyle(tool === 'arrow')} onClick={() => setTool('arrow')}>➡️ Flecha</button>
          <button style={toolBtnStyle(tool === 'erase')} onClick={() => setTool('erase')}>🧹 Borrar</button>

          {tool === 'arrow' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#8b949e' }}>Color:</span>
              {['#ff0000', '#ffff00', '#00ff00', '#ffffff', '#ff6600'].map(c => (
                <div key={c} onClick={() => setArrowColor(c)}
                  style={{ width: '24px', height: '24px', background: c, borderRadius: '50%', cursor: 'pointer', border: arrowColor === c ? '3px solid white' : '2px solid #444' }} />
              ))}
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button onClick={isPlaying ? stopAnimation : playAnimation}
              style={{ padding: '8px 16px', background: isPlaying ? '#ff4444' : '#00ff88', color: '#0d1117', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {isPlaying ? '⏹ Detener' : '▶ Animar'}
            </button>
            <button onClick={clearBoard}
              style={{ padding: '8px 16px', background: '#21262d', color: 'white', border: '1px solid #30363d', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '2px solid #21262d', boxShadow: '0 0 40px rgba(0,212,255,0.1)' }}>
          <canvas
            ref={canvasRef}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            style={{ width: '100%', height: '100%', cursor: tool === 'move' ? 'grab' : tool === 'arrow' ? 'crosshair' : 'cell', display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Info */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
          <span>👥 {boardPlayers.length} jugadores en cancha</span>
          <span>➡️ {arrows.length} movimientos</span>
          <span style={{ color: '#4a9eff' }}>
            {tool === 'move' ? 'Arrastra los jugadores' : tool === 'arrow' ? 'Haz clic y arrastra para dibujar movimientos' : 'Haz clic en una flecha para borrarla'}
          </span>
        </div>
      </div>

      {/* Panel derecho - Jugadores en cancha */}
      <div style={{ width: '160px', background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#8b949e' }}>EN CANCHA</h3>
        {boardPlayers.length === 0 && <p style={{ color: '#6b7280', fontSize: '12px' }}>Agrega jugadores desde el panel izquierdo.</p>}
        {boardPlayers.map(player => (
          <div key={player.id} style={{ marginBottom: '8px', padding: '8px', background: '#0d1117', borderRadius: '8px', border: `1px solid ${player.color}44` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '10px', height: '10px', background: player.color, borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>#{player.number}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>{player.name}</div>
            <button onClick={() => removePlayerFromBoard(player.id)}
              style={{ width: '100%', padding: '3px', background: '#ff444422', border: '1px solid #ff444444', borderRadius: '4px', color: '#ff6666', cursor: 'pointer', fontSize: '11px' }}>
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TacticalBoard;