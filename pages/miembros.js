import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Layout from '../components/Layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lfaftechapi-7nrb.onrender.com/api';

function MiembrosDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('estudio');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ title: '', content: '', videoType: 'short', image: null });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('lfaf_member');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchHistory(parsedUser.googleId);
    }
  }, []);

  const fetchHistory = async (googleId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/member/history/${googleId}`);
      const data = await res.json();
      if (data.success) setHistory(data.articles);
    } catch (err) {
      console.error("Error cargando historial", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const syncResponse = await fetch(`${API_URL}/member/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: userInfo.sub, email: userInfo.email,
            displayName: userInfo.name, avatar: userInfo.picture,
            tokens: tokenResponse 
          }),
        });

        const data = await syncResponse.json();
        if (data.success) {
          setUser(data.member);
          localStorage.setItem('lfaf_member', JSON.stringify(data.member));
          fetchHistory(data.member.googleId);
        } else {
          setError('No se pudo verificar tu membresía. Asegúrate de estar suscrito.');
        }
      } catch (err) {
        setError('Error de conexión con el servidor. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Inicio de sesión cancelado.')
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lfaf_member');
    setHistory([]);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.title || !formData.content) {
      setPublishMessage({ type: 'error', text: '⚠️ Por favor, completa todos los campos y sube una imagen.' });
      return;
    }
    setPublishing(true); setPublishMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('googleId', user.googleId);
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('videoType', formData.videoType);
    data.append('image', formData.image);

    try {
      const res = await fetch(`${API_URL}/member/publish`, { method: 'POST', body: data });
      const result = await res.json();

      if (result.success) {
        setPublishMessage({ type: 'success', text: '✅ ¡Publicación exitosa! Tu video está siendo generado.' });
        const updatedUser = { ...user, creditsUsed: user.creditsUsed + 1 };
        setUser(updatedUser);
        localStorage.setItem('lfaf_member', JSON.stringify(updatedUser));
        
        setFormData({ title: '', content: '', videoType: 'short', image: null });
        setImagePreview(null);
        fetchHistory(user.googleId);
        
        setTimeout(() => setActiveTab('historial'), 2000);
      } else {
        setPublishMessage({ type: 'error', text: result.error || '❌ Error al intentar publicar.' });
      }
    } catch (err) {
      setPublishMessage({ type: 'error', text: '❌ Ocurrió un error de conexión.' });
    } finally {
      setPublishing(false);
    }
  };

  const hasCredits = user ? (user.totalCredits - user.creditsUsed > 0) : false;

  return (
    <Layout>
      <Head>
        <title>Portal Premium de Creadores | Noticias LAT</title>
      </Head>

      <div className="main-content">
        {!user ? (
          <>
            {/* HERO USANDO TU CSS EXISTENTE */}
            <div className="static-hero" style={{ padding: '4rem 1rem', marginBottom: '2rem' }}>
              <div className="container">
                <span className="member-badge-hero">PROGRAMA DE CREADORES ASOCIADOS</span>
                <h1 style={{ marginTop: '1rem', fontSize: '3.5rem' }}>Transforma tus ideas en<br/> <span style={{color: 'var(--color-accent)'}}>Videos Virales</span></h1>
                <p>Al unirte a las membresías de nuestros canales, desbloqueas el acceso exclusivo a nuestro motor de Inteligencia Artificial.</p>
                
                <button onClick={() => login()} disabled={loading} className="btn-login-google">
                  {loading ? 'Conectando...' : 'ENTRAR CON YOUTUBE / GOOGLE'}
                </button>
                {error && <div className="error-msg">{error}</div>}
              </div>
            </div>

            {/* BENTO GRID USANDO TU CSS EXISTENTE */}
            <div className="container">
              <div className="bento-grid" style={{ marginBottom: '4rem' }}>
                <div className="static-card" style={{ textAlign: 'center' }}>
                  <div className="icon-box">📰</div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-texto-titulos)' }}>Artículo en Web</h3>
                  <p>Tu noticia se publicará directamente en la portada de Noticias LAT, ganando visibilidad inmediata.</p>
                </div>
                <div className="static-card" style={{ textAlign: 'center' }}>
                  <div className="icon-box">🤖</div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-texto-titulos)' }}>Video Automatizado</h3>
                  <p>Procesamos tu texto, aplicamos voz neuronal y generamos un video para YouTube de forma automática.</p>
                </div>
                <div className="static-card" style={{ textAlign: 'center' }}>
                  <div className="icon-box">📈</div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--color-texto-titulos)' }}>Créditos Acumulativos</h3>
                  <p>Mientras a más canales estés suscrito, más poder de publicación tendrás (hasta 24 al mes).</p>
                </div>
              </div>

              <div className="static-card" style={{ background: 'var(--color-tech-bg)', color: 'white', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Elige tu Canal y Hazte Miembro</h2>
                <p style={{ color: 'var(--color-texto-suave)', marginBottom: '2rem' }}>Selecciona cualquiera de nuestros canales oficiales.</p>
                <div className="channels-grid">
                  <a href="https://www.youtube.com/channel/UCMmKU1g6g5JWdLtzLxs5NKg/join" target="_blank" className="channel-btn">▶️ Última Hora</a>
                  <a href="https://www.youtube.com/channel/UC1oqIJVGLAa1CB5yAH5fDyA/join" target="_blank" className="channel-btn">▶️ Noticias AHORA</a>
                  <a href="https://www.youtube.com/channel/UCOW3IHGU3XK9oS-o8HnPtpw/join" target="_blank" className="channel-btn">▶️ Noticias HOY</a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container" style={{ marginTop: '2rem' }}>
            
            {/* PANEL DE CONTROL SUPERIOR */}
            <div className="static-card user-header-panel">
              <div className="user-info">
                <div style={{ position: 'relative' }}>
                  <img src={user.avatar} alt="Perfil" className="user-avatar" />
                  {user.membershipLevel > 0 && <span className="level-badge">LVL {user.membershipLevel}</span>}
                </div>
                <div>
                  <h2 style={{ color: 'var(--color-texto-titulos)', fontSize: '1.5rem' }}>{user.displayName}</h2>
                  <p style={{ color: 'var(--color-texto-suave)' }}>{user.email}</p>
                </div>
              </div>
              
              <div className="panel-tabs">
                <button onClick={() => setActiveTab('estudio')} className={`tab-btn ${activeTab === 'estudio' ? 'active' : ''}`}>Estudio Creativo</button>
                <button onClick={() => setActiveTab('historial')} className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}>Mi Historial</button>
                <button onClick={logout} className="tab-btn logout">Salir</button>
              </div>
            </div>

            {/* PESTAÑA: ESTUDIO DE CREACIÓN */}
            {activeTab === 'estudio' && (
              <div className="tab-content fade-in">
                <div className="stats-grid">
                  <div className="stat-card" style={{ background: 'var(--color-primario)', color: 'white' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem', opacity: 0.8 }}>CRÉDITOS LISTOS</p>
                    <h3 style={{ fontSize: '3rem', margin: '10px 0' }}>{user.totalCredits - user.creditsUsed}</h3>
                    <p style={{ fontSize: '0.9rem' }}>De {user.totalCredits} totales este mes</p>
                  </div>
                  <div className="stat-card">
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-texto-suave)' }}>NIVEL MULTIPLICADOR</p>
                    <h3 style={{ fontSize: '2rem', margin: '10px 0', color: 'var(--color-texto-titulos)' }}>Nivel {user.membershipLevel}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-texto-suave)' }}>Basado en suscripciones activas</p>
                  </div>
                  <div className="stat-card">
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-texto-suave)' }}>RENOVACIÓN</p>
                    <h3 style={{ fontSize: '1.8rem', margin: '10px 0', color: 'var(--color-texto-titulos)' }}>
                      {user.nextResetDate ? new Date(user.nextResetDate).toLocaleDateString() : 'N/A'}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-texto-suave)' }}>Tus créditos se reiniciarán</p>
                  </div>
                </div>

                <div className="static-card" style={{ marginTop: '2rem' }}>
                  {!hasCredits ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                      <div className="icon-box" style={{ background: '#fff7ed', color: '#ea580c', margin: '0 auto 1rem auto' }}>🔒</div>
                      <h3 style={{ fontSize: '1.8rem', color: 'var(--color-texto-titulos)' }}>No tienes créditos disponibles</h3>
                      <p style={{ color: 'var(--color-texto-suave)', marginTop: '1rem' }}>Renueva tu membresía o suscríbete a un canal para publicar.</p>
                    </div>
                  ) : (
                    <div className="form-container">
                      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-texto-titulos)' }}>Crea tu próxima Noticia</h2>
                      
                      {publishMessage.text && (
                        <div className={`message-box ${publishMessage.type === 'error' ? 'msg-error' : 'msg-success'}`}>
                          {publishMessage.text}
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label>1. Titular de Impacto</label>
                          <input 
                            type="text" required maxLength="100" className="form-input"
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            placeholder="Ej: LFAF Tech anuncia nueva IA..." 
                          />
                        </div>

                        <div className="form-group">
                          <label>2. Cuerpo de la Noticia</label>
                          <textarea 
                            required rows="6" className="form-input"
                            value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} 
                            placeholder="Desarrolla aquí la información. Nuestro motor extraerá el guion..."
                          ></textarea>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>3. Imagen en Alta Calidad</label>
                            <input type="file" required accept="image/*" id="file-upload" style={{display: 'none'}} onChange={handleImageChange} />
                            <label htmlFor="file-upload" className="file-upload-box">
                              {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="img-preview" />
                              ) : (
                                <div style={{ color: 'var(--color-texto-suave)' }}>
                                  <span style={{ fontSize: '2rem', display: 'block' }}>📸</span>
                                  Clic para subir imagen
                                </div>
                              )}
                            </label>
                          </div>

                          <div className="form-group">
                            <label>4. Formato de YouTube</label>
                            <div className="radio-group">
                              <label className={`radio-option ${formData.videoType === 'short' ? 'selected' : ''}`}>
                                <input type="radio" name="videoType" value="short" checked={formData.videoType === 'short'} onChange={(e) => setFormData({...formData, videoType: e.target.value})} style={{display:'none'}} />
                                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📱</span>
                                <div>
                                  <strong>YouTube Short</strong>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-suave)' }}>Formato Vertical</div>
                                </div>
                              </label>
                              <label className={`radio-option ${formData.videoType === 'video' ? 'selected' : ''}`}>
                                <input type="radio" name="videoType" value="video" checked={formData.videoType === 'video'} onChange={(e) => setFormData({...formData, videoType: e.target.value})} style={{display:'none'}} />
                                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>💻</span>
                                <div>
                                  <strong>Video Normal</strong>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-suave)' }}>Formato Horizontal</div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <button type="submit" disabled={publishing} className="btn-submit">
                          {publishing ? 'Procesando con IA...' : '🚀 PUBLICAR Y GENERAR VIDEO (-1 Crédito)'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA: HISTORIAL */}
            {activeTab === 'historial' && (
              <div className="static-card tab-content fade-in" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ color: 'var(--color-texto-titulos)' }}>Tus Publicaciones</h2>
                  <button onClick={() => fetchHistory(user.googleId)} className="btn-refresh">↻ Actualizar</button>
                </div>

                {loadingHistory ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>Sincronizando con los servidores...</div>
                ) : history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--color-fondo-body)', borderRadius: '12px' }}>
                    <span style={{ fontSize: '3rem' }}>👻</span>
                    <h3 style={{ marginTop: '1rem', color: 'var(--color-texto-titulos)' }}>Aún no hay publicaciones</h3>
                    <p style={{ color: 'var(--color-texto-suave)' }}>Ve al Estudio Creativo para crear tu primera noticia.</p>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map((article) => (
                      <div key={article._id} className="history-item">
                        <div className="history-date">
                          <strong>{new Date(article.publishDate || article.createdAt).getDate()}</strong>
                          <span>{new Date(article.publishDate || article.createdAt).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="history-info">
                          <h4>{article.title}</h4>
                          <div className="history-badges">
                            <span className={`badge ${article.videoType === 'short' ? 'badge-purple' : 'badge-blue'}`}>
                              {article.videoType === 'short' ? '📱 Short' : '💻 Video'}
                            </span>
                            <span className="badge badge-green">
                              {article.status === 'published' ? 'Activo en Web' : 'Procesando'}
                            </span>
                          </div>
                        </div>
                        <Link href={`/articulo/${article._id}`} className="btn-view">Ver ↗</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ESTILOS INTERNOS PARA NO AFECTAR TU CSS EXTERNO NI USAR TAILWIND */}
      <style jsx>{`
        .member-badge-hero {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: bold;
          letter-spacing: 2px;
        }
        .btn-login-google {
          background: white;
          color: var(--color-texto-titulos);
          border: 2px solid var(--color-borde);
          padding: 15px 30px;
          font-size: 1.1rem;
          font-weight: 800;
          border-radius: 50px;
          margin-top: 2rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: var(--sombra-md);
        }
        .btn-login-google:hover {
          border-color: var(--color-primario);
          color: var(--color-primario);
          transform: translateY(-2px);
        }
        .error-msg {
          margin-top: 1rem;
          color: #ef4444;
          background: #fef2f2;
          padding: 10px;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
        }
        .icon-box {
          width: 70px;
          height: 70px;
          background: var(--color-primario-light);
          color: var(--color-primario);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1.5rem auto;
        }
        .channels-grid {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .channel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 15px 25px;
          border-radius: 12px;
          font-weight: bold;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .channel-btn:hover { background: var(--color-accent); }
        .user-header-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.5rem 2rem;
        }
        .user-info { display: flex; align-items: center; gap: 1rem; }
        .user-avatar { width: 70px; height: 70px; border-radius: 50%; border: 3px solid var(--color-borde); object-fit: cover;}
        .level-badge {
          position: absolute;
          bottom: -5px; right: -5px;
          background: #eab308; color: white;
          font-size: 0.7rem; font-weight: bold;
          padding: 3px 8px; border-radius: 20px;
          border: 2px solid white;
        }
        .panel-tabs { display: flex; gap: 10px; background: var(--color-fondo-body); padding: 5px; border-radius: 12px; }
        .tab-btn {
          background: none; border: none; padding: 10px 20px;
          font-weight: bold; color: var(--color-texto-suave); border-radius: 8px;
          cursor: pointer; transition: 0.2s;
        }
        .tab-btn.active { background: white; color: var(--color-primario); box-shadow: var(--sombra-sm); }
        .tab-btn.logout { color: #ef4444; }
        .tab-btn.logout:hover { background: #fef2f2; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .stat-card { background: white; padding: 2rem; border-radius: var(--radio-card); box-shadow: var(--sombra-sm); border: 1px solid var(--color-borde); }
        .form-container { max-width: 800px; margin: 0 auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: bold; margin-bottom: 0.5rem; color: var(--color-texto-titulos); }
        .form-input {
          width: 100%; padding: 15px; border-radius: 12px;
          border: 1px solid var(--color-borde); background: var(--color-fondo-body);
          font-family: inherit; font-size: 1rem; transition: 0.3s; outline: none;
        }
        .form-input:focus { border-color: var(--color-primario); background: white; box-shadow: 0 0 0 3px var(--color-primario-light); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
        .file-upload-box {
          display: flex; align-items: center; justify-content: center;
          height: 120px; border: 2px dashed var(--color-borde); border-radius: 12px;
          cursor: pointer; text-align: center; font-weight: bold; transition: 0.2s;
          background: var(--color-fondo-body); overflow: hidden;
        }
        .file-upload-box:hover { border-color: var(--color-primario); background: var(--color-primario-light); }
        .img-preview { width: 100%; height: 100%; object-fit: cover; }
        .radio-group { display: flex; flex-direction: column; gap: 10px; }
        .radio-option {
          display: flex; align-items: center; padding: 12px; border: 2px solid var(--color-borde);
          border-radius: 12px; cursor: pointer; transition: 0.2s; background: white;
        }
        .radio-option.selected { border-color: var(--color-primario); background: var(--color-primario-light); }
        .btn-submit {
          width: 100%; background: #16a34a; color: white; padding: 20px;
          border: none; border-radius: 12px; font-weight: 900; font-size: 1.2rem;
          cursor: pointer; transition: 0.3s; margin-top: 1rem; box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(22, 163, 74, 0.3); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .message-box { padding: 15px; border-radius: 12px; font-weight: bold; text-align: center; margin-bottom: 2rem; }
        .msg-error { background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; }
        .msg-success { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
        .history-list { display: flex; flex-direction: column; gap: 1rem; }
        .history-item {
          display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem;
          background: var(--color-fondo-body); border-radius: 12px; border: 1px solid var(--color-borde);
          transition: 0.2s;
        }
        .history-item:hover { background: white; box-shadow: var(--sombra-md); border-color: var(--color-primario-light); }
        .history-date { text-align: center; background: white; padding: 10px; border-radius: 8px; border: 1px solid var(--color-borde); min-width: 70px; }
        .history-date strong { display: block; font-size: 1.5rem; line-height: 1; color: var(--color-texto-titulos); }
        .history-date span { font-size: 0.75rem; text-transform: uppercase; color: var(--color-texto-suave); font-weight: bold; }
        .history-info { flex-grow: 1; }
        .history-info h4 { margin-bottom: 0.5rem; color: var(--color-texto-titulos); font-size: 1.1rem; }
        .history-badges { display: flex; gap: 10px; }
        .badge { padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
        .badge-purple { background: #f3e8ff; color: #7e22ce; }
        .badge-blue { background: #e0f2fe; color: #0284c7; }
        .badge-green { background: #dcfce7; color: #16a34a; }
        .btn-view { background: var(--color-tech-bg); color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
        .btn-view:hover { background: black; }
        .btn-refresh { background: var(--color-fondo-body); border: 1px solid var(--color-borde); padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .btn-refresh:hover { background: white; border-color: var(--color-primario); color: var(--color-primario); }
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
}

export default function Miembros() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return <div style={{textAlign: 'center', padding: '5rem', color: 'red'}}>Faltan credenciales de Google</div>;
  }
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MiembrosDashboard />
    </GoogleOAuthProvider>
  );
}