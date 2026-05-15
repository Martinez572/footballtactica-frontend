import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Report {
  id: string;
  analysisType: string;
  summary: string;
  content: string;
  createdAt: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadReports = useCallback(async () => {
    try {
      const response = await api.get(`/api/v1/reports/user/${user?.userId}`);
      setReports(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setFileType('video');
      setFilePreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('image/')) {
      setFileType('image');
      setFilePreview(URL.createObjectURL(file));
    } else {
      alert('Solo se aceptan videos e imágenes.');
      return;
    }
    setAttachedFile(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateReport = async () => {
    if (!prompt.trim() && !attachedFile) return;
    setLoading(true);
    try {
      if (attachedFile) {
        const formData = new FormData();
        formData.append('video', attachedFile);
        formData.append('prompt', prompt || 'Analiza este contenido en detalle desde una perspectiva táctica profesional de fútbol.');
        await api.post(`/api/v1/reports/video-file/${user?.userId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/api/v1/reports/tactic/${user?.userId}`, {
          tacticName: 'Análisis libre',
          formation: 'Libre',
          description: prompt,
        });
      }
      setPrompt('');
      removeFile();
      await loadReports();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      generateReport();
    }
  };

  const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
    PLAYER: { label: 'Jugador', color: '#00d4ff', icon: '👤' },
    TACTIC: { label: 'Táctica', color: '#00ff88', icon: '📋' },
    VIDEO: { label: 'Video', color: '#ffd700', icon: '🎬' },
    COMPARISON: { label: 'Comparativa', color: '#ff6b9d', icon: '⚖️' },
  };

  const suggestions = [
    'Analiza al jugador #9 del equipo rojo y dime qué está haciendo mal',
    'Evalúa la línea defensiva completa del equipo azul',
    '¿Qué formación debería usar contra un equipo que juega en bloque bajo?',
    'Analiza el mediocampo y dime quién está fallando',
    'Dame un plan de entrenamiento para mejorar la presión alta',
    'Compara un sistema 4-3-3 vs 4-4-2 para un equipo físico',
  ];

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} style={{
            color: '#00d4ff', margin: '20px 0 10px',
            fontSize: '16px', fontWeight: '700',
            borderBottom: '1px solid #21262d', paddingBottom: '6px'
          }}>
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} style={{ color: '#4a9eff', margin: '14px 0 6px', fontSize: '14px', fontWeight: '600' }}>{line.replace('### ', '')}</h4>;
      }
      if (line.match(/^\*\*.*\*\*$/)) {
        return <strong key={i} style={{ color: '#e6edf3', display: 'block', marginBottom: '4px' }}>{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: '8px', margin: '4px 0 4px 8px' }}>
            <span style={{ color: '#00d4ff', flexShrink: 0 }}>•</span>
            <span style={{ color: '#c9d1d9', fontSize: '14px', lineHeight: '1.6' }}>{line.substring(2)}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
      return <p key={i} style={{ color: '#c9d1d9', margin: '4px 0', fontSize: '14px', lineHeight: '1.7' }}>{line}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', color: 'white', overflow: 'hidden' }}>

      {/* Panel izquierdo — Historial */}
      <div style={{
        width: '280px', borderRight: '1px solid #21262d',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        background: '#0d1117',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #21262d' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>🤖 Análisis IA</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '12px' }}>Powered by Gemini 2.5</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {reports.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '24px 8px' }}>
              No hay análisis aún. Escribe tu primera consulta.
            </p>
          )}
          {reports.slice().reverse().map(report => {
            const type = typeLabels[report.analysisType] || { label: 'Análisis', color: '#8b949e', icon: '📄' };
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                style={{
                  padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  marginBottom: '8px',
                  background: selectedReport?.id === report.id ? '#161b22' : 'transparent',
                  border: `1px solid ${selectedReport?.id === report.id ? type.color + '44' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (selectedReport?.id !== report.id)
                    e.currentTarget.style.background = '#161b22';
                }}
                onMouseLeave={e => {
                  if (selectedReport?.id !== report.id)
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{type.icon}</span>
                  <span style={{ color: type.color, fontSize: '11px', fontWeight: '600' }}>{type.label}</span>
                  <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '10px' }}>
                    {new Date(report.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p style={{
                  color: '#8b949e', margin: 0, fontSize: '12px', lineHeight: '1.4',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {report.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Contenido del reporte */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {selectedReport ? (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px' }}>{typeLabels[selectedReport.analysisType]?.icon || '📄'}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                    Reporte de {typeLabels[selectedReport.analysisType]?.label || 'Análisis'}
                  </h2>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                    {new Date(selectedReport.createdAt).toLocaleDateString('es', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  style={{
                    marginLeft: 'auto', padding: '8px 16px',
                    background: 'transparent', border: '1px solid #30363d',
                    borderRadius: '8px', color: '#8b949e', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  ✕ Cerrar
                </button>
              </div>
              <div style={{
                background: '#161b22', border: '1px solid #21262d',
                borderRadius: '12px', padding: '28px',
              }}>
                {formatContent(selectedReport.content)}
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              maxWidth: '600px', margin: '0 auto', paddingTop: '40px',
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '700' }}>
                Analista Táctico IA
              </h2>
              <p style={{ color: '#6b7280', margin: '0 0 32px', textAlign: 'center', fontSize: '14px' }}>
                Escribe cualquier consulta táctica, adjunta un video o imagen de una jugada,<br />
                y obtén un análisis profesional al instante.
              </p>

              {/* Sugerencias */}
              <div style={{ width: '100%' }}>
                <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '12px' }}>💡 Sugerencias:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setPrompt(s);
                        textareaRef.current?.focus();
                      }}
                      style={{
                        padding: '12px 16px', background: '#161b22',
                        border: '1px solid #21262d', borderRadius: '10px',
                        color: '#c9d1d9', cursor: 'pointer', fontSize: '13px',
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#00d4ff44'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#21262d'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de input */}
        <div style={{ borderTop: '1px solid #21262d', padding: '16px 24px', background: '#0d1117' }}>

          {/* Preview del archivo adjunto */}
          {attachedFile && (
            <div style={{
              marginBottom: '12px', padding: '10px 14px',
              background: '#161b22', border: '1px solid #21262d',
              borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              {fileType === 'video' && filePreview && (
                <video src={filePreview} style={{ width: '80px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
              )}
              {fileType === 'image' && filePreview && (
                <img src={filePreview} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#c9d1d9', fontSize: '13px', fontWeight: '600' }}>{attachedFile.name}</div>
                <div style={{ color: '#6b7280', fontSize: '11px' }}>
                  {fileType === 'video' ? '🎬 Video' : '🖼️ Imagen'} — {(attachedFile.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <button onClick={removeFile} style={{
                background: 'none', border: 'none', color: '#6b7280',
                cursor: 'pointer', fontSize: '18px', padding: '4px',
              }}>✕</button>
            </div>
          )}

          <div style={{
            display: 'flex', gap: '8px', alignItems: 'flex-end',
            background: '#161b22', border: '1px solid #30363d',
            borderRadius: '12px', padding: '8px 12px',
          }}>
            {/* Botón adjuntar archivo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', fontSize: '20px', padding: '6px',
                borderRadius: '8px', transition: 'all 0.15s',
                flexShrink: 0,
              }}
              title="Adjuntar video o imagen"
              onMouseEnter={e => { e.currentTarget.style.color = '#00d4ff'; e.currentTarget.style.background = '#00d4ff11'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'none'; }}
            >
              📎
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta táctica... (Ctrl+Enter para enviar)"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'white', fontSize: '14px', resize: 'none',
                fontFamily: 'inherit', lineHeight: '1.5',
                minHeight: '24px', maxHeight: '120px',
                padding: '6px 0',
              }}
              rows={1}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />

            <button
              onClick={generateReport}
              disabled={loading || (!prompt.trim() && !attachedFile)}
              style={{
                background: loading || (!prompt.trim() && !attachedFile) ? '#21262d' : 'linear-gradient(135deg, #00d4ff, #0066ff)',
                border: 'none', borderRadius: '8px',
                color: 'white', cursor: loading || (!prompt.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                padding: '8px 16px', fontSize: '14px', fontWeight: '600',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳' : '🚀 Analizar'}
            </button>
          </div>

          <p style={{ color: '#6b7280', fontSize: '11px', margin: '8px 0 0', textAlign: 'center' }}>
            Puedes adjuntar videos e imágenes de jugadas • Ctrl+Enter para enviar
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;