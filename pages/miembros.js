import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function MiembrosDashboard() {
  // Estados de Usuario y Autenticación
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navegación del Panel
  const [activeTab, setActiveTab] = useState('estudio'); // 'estudio' | 'historial'
  
  // Estados de Datos
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Estados del Formulario de Publicación
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoType: 'short',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('lfaf_member');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchHistory(parsedUser.googleId);
    }
  }, []);

  // Función para obtener el historial de publicaciones del backend
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

  // Autenticación con Google y verificación en API
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
          setError('No se pudo verificar tu membresía con nuestros canales.');
        }
      } catch (err) {
        setError('Error de conexión con el servidor maestro.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Proceso de inicio de sesión cancelado.')
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
      setPublishMessage({ type: 'error', text: '⚠️ Debes completar todos los campos y subir una imagen.' });
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
        setPublishMessage({ type: 'success', text: '✅ ¡Tu noticia está siendo procesada y el video se generará pronto!' });
        const updatedUser = { ...user, creditsUsed: user.creditsUsed + 1 };
        setUser(updatedUser);
        localStorage.setItem('lfaf_member', JSON.stringify(updatedUser));
        
        // Limpiar formulario y recargar historial
        setFormData({ title: '', content: '', videoType: 'short', image: null });
        setImagePreview(null);
        fetchHistory(user.googleId);
        
        // Mover al usuario a la pestaña de historial tras 2 segundos
        setTimeout(() => setActiveTab('historial'), 2000);
      } else {
        setPublishMessage({ type: 'error', text: result.error || '❌ Error al intentar publicar.' });
      }
    } catch (err) {
      setPublishMessage({ type: 'error', text: '❌ Ocurrió un error de conexión con nuestros servidores.' });
    } finally {
      setPublishing(false);
    }
  };

  const hasCredits = user ? (user.totalCredits - user.creditsUsed > 0) : false;

  // COMPONENTE INTERNO: Landing Page Espectacular para No Logueados / No Miembros
  const GuestLanding = () => (
    <div className="space-y-24 py-12">
      {/* Hero Principal */}
      <div className="text-center space-y-8 max-w-5xl mx-auto px-4">
        <div className="inline-block bg-red-100 text-red-700 px-6 py-2 rounded-full font-bold tracking-widest text-sm mb-4 border border-red-200">
          PROGRAMA DE CREADORES ASOCIADOS
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Transforma tus ideas en <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-600">
            Noticias y Videos Virales
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Al unirte a las membresías de nuestros canales, desbloqueas el acceso exclusivo a nuestro motor de Inteligencia Artificial. Tú pones el texto, nosotros creamos el contenido 4K.
        </p>
      </div>

      {/* Grid de Beneficios (Estilo Bento Box) */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 text-red-600 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner">📰</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Artículo en Web</h3>
          <p className="text-gray-600 leading-relaxed">Tu noticia se publicará directamente en la portada de Noticias LAT, ganando visibilidad inmediata frente a miles de lectores diarios.</p>
        </div>
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner">🤖</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Video Automatizado</h3>
          <p className="text-gray-600 leading-relaxed">Nuestros servidores procesan tu texto, le aplican voz neuronal y generan un video profesional para YouTube de forma automática.</p>
        </div>
        <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner">📈</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Créditos Acumulativos</h3>
          <p className="text-gray-600 leading-relaxed">Obtén desde 1 hasta 24 publicaciones mensuales. Mientras a más canales estés suscrito, más poder de publicación tendrás.</p>
        </div>
      </div>

      {/* Call To Action - Canales */}
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl max-w-5xl mx-auto border border-gray-800">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Elige tu Canal y Hazte Miembro</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Selecciona cualquiera de nuestros canales oficiales, elige el nivel que prefieras (Básico, Pro o VIP) y regresa aquí para empezar a crear.</p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <a href="https://www.youtube.com/channel/UCMmKU1g6g5JWdLtzLxs5NKg/join" target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-50 transition-opacity"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-left">
                <h4 className="text-2xl font-bold text-white mb-1">Última Hora</h4>
                <p className="text-gray-400 text-sm">Noticias de impacto rápido</p>
              </div>
              <span className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl group-hover:scale-105 transition-transform">Unirse ↗</span>
            </div>
          </a>
          
          <a href="https://www.youtube.com/channel/UC1oqIJVGLAa1CB5yAH5fDyA/join" target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-50 transition-opacity"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-left">
                <h4 className="text-2xl font-bold text-white mb-1">Noticias AHORA</h4>
                <p className="text-gray-400 text-sm">Actualidad internacional</p>
              </div>
              <span className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl group-hover:scale-105 transition-transform">Unirse ↗</span>
            </div>
          </a>

          <a href="https://www.youtube.com/channel/UCOW3IHGU3XK9oS-o8HnPtpw/join" target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl border border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-50 transition-opacity"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-left">
                <h4 className="text-2xl font-bold text-white mb-1">Noticias HOY</h4>
                <p className="text-gray-400 text-sm">Resumen diario</p>
              </div>
              <span className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl group-hover:scale-105 transition-transform">Unirse ↗</span>
            </div>
          </a>

          <div className="relative overflow-hidden bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 flex items-center justify-center opacity-70">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-400 mb-1">4to Canal LFAF</h4>
              <p className="text-gray-500 text-sm">Próximamente disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-red-200">
      <Head><title>Portal Premium de Creadores | Noticias LAT</title></Head>
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        
        {/* CABECERA DE LOGIN ESTADO DESCONECTADO */}
        {!user ? (
          <div className="text-center mb-8 relative z-10">
            <button 
              onClick={() => login()} disabled={loading}
              className="bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-600 hover:text-blue-600 text-xl font-extrabold py-5 px-14 rounded-full transition-all shadow-2xl hover:shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:-translate-y-1 flex items-center justify-center gap-4 mx-auto"
            >
              {loading ? (
                <span className="animate-pulse">Conectando con Google...</span>
              ) : (
                <>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-8 h-8" alt="Google" />
                  ENTRAR Y VERIFICAR MEMBRESÍA
                </>
              )}
            </button>
            {error && (
              <div className="mt-6 animate-fade-in">
                <span className="bg-red-100 text-red-800 border border-red-200 font-bold py-3 px-6 rounded-xl inline-block shadow-sm">
                  {error}
                </span>
              </div>
            )}
            <GuestLanding />
          </div>
        ) : (
          
          /* PANEL DE CONTROL DEL USUARIO LOGUEADO */
          <div className="space-y-10 animate-fade-in">
            
            {/* Top Bar del Usuario */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 sticky top-4 z-40">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={user.avatar} alt="Perfil" className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover" />
                  {user.membershipLevel > 0 && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-white shadow-sm">
                      LVL {user.membershipLevel}
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.displayName}</h2>
                  <p className="text-gray-500 font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex bg-gray-100 p-2 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('estudio')} 
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'estudio' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Estudio Creativo
                </button>
                <button 
                  onClick={() => setActiveTab('historial')} 
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'historial' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Mi Historial
                </button>
                <button onClick={logout} className="px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 ml-2 transition">
                  Salir
                </button>
              </div>
            </div>

            {/* PESTAÑA: ESTUDIO DE CREACIÓN */}
            {activeTab === 'estudio' && (
              <div className="space-y-8">
                
                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-blue-200 uppercase tracking-widest text-sm font-extrabold mb-2">Créditos Listos</h3>
                      <div className="text-7xl font-black">{user.totalCredits - user.creditsUsed}</div>
                      <p className="mt-4 text-blue-100 font-medium">De {user.totalCredits} totales este mes</p>
                    </div>
                    <div className="absolute -bottom-10 -right-4 text-9xl opacity-20">🔥</div>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-extrabold mb-4">Nivel Multiplicador</h3>
                    <div className="text-4xl font-black text-gray-900">Nivel {user.membershipLevel}</div>
                    <p className="text-gray-500 mt-4 font-medium">Basado en tus suscripciones activas.</p>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-gray-400 uppercase tracking-widest text-sm font-extrabold mb-4">Renovación de Ciclo</h3>
                    <div className="text-3xl font-black text-gray-900">
                      {user.nextResetDate ? new Date(user.nextResetDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <p className="text-gray-500 mt-4 font-medium">Tus créditos se reiniciarán este día.</p>
                  </div>
                </div>

                {/* Formulario o Bloqueo por Créditos */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                  {!hasCredits ? (
                     <div className="p-16 text-center bg-gray-50">
                        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🔒</div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">No tienes créditos disponibles</h3>
                        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">Para habilitar el Estudio de Creación, necesitas una membresía activa en YouTube o esperar a tu fecha de renovación.</p>
                        <GuestLanding />
                     </div>
                  ) : (
                    <div className="p-10 md:p-16">
                      <div className="max-w-4xl mx-auto space-y-10">
                        
                        <div className="text-center mb-12">
                          <h3 className="text-4xl font-extrabold text-gray-900 mb-4">Crea tu próxima Noticia</h3>
                          <p className="text-xl text-gray-500">Completa la información con calidad. El motor IA se encargará del resto.</p>
                        </div>

                        {publishMessage.text && (
                          <div className={`p-6 rounded-2xl font-bold text-lg text-center border ${publishMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {publishMessage.text}
                          </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                          
                          {/* Campo 1: Título */}
                          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 transition-all focus-within:bg-white focus-within:shadow-xl focus-within:border-blue-200">
                            <label className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                              Titular de Impacto
                            </label>
                            <input 
                              type="text" required maxLength="100"
                              className="w-full bg-transparent text-3xl font-bold text-gray-800 placeholder-gray-300 outline-none"
                              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                              placeholder="Ej: LFAF Tech anuncia nueva IA..." 
                            />
                            <div className="text-right text-sm text-gray-400 font-medium mt-2">{formData.title.length}/100</div>
                          </div>

                          {/* Campo 2: Contenido */}
                          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 transition-all focus-within:bg-white focus-within:shadow-xl focus-within:border-blue-200">
                            <label className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                              Cuerpo de la Noticia
                            </label>
                            <textarea 
                              required rows="6" 
                              className="w-full bg-transparent text-xl leading-relaxed text-gray-700 placeholder-gray-300 outline-none resize-none"
                              value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} 
                              placeholder="Desarrolla aquí la información. Nuestro motor extraerá el guion perfecto para el video basándose en este texto..."
                            ></textarea>
                          </div>

                          {/* Campo 3 y 4: Imagen y Formato */}
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col justify-between">
                              <div>
                                <label className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                  <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
                                  Imagen en Alta Calidad
                                </label>
                                <input 
                                  type="file" required accept="image/*" id="file-upload" className="hidden"
                                  onChange={handleImageChange} 
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block text-center border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-2xl p-8 transition-all">
                                  {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl shadow-md" />
                                  ) : (
                                    <div className="text-gray-500 font-bold">
                                      <span className="text-4xl block mb-2">📸</span>
                                      Clic para subir imagen
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col justify-between">
                              <div>
                                <label className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                                  <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">4</span>
                                  Formato de YouTube
                                </label>
                                <div className="space-y-4">
                                  <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.videoType === 'short' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <input type="radio" name="videoType" value="short" className="hidden" checked={formData.videoType === 'short'} onChange={(e) => setFormData({...formData, videoType: e.target.value})} />
                                    <div className="text-3xl mr-4">📱</div>
                                    <div>
                                      <div className="font-extrabold text-gray-900 text-lg">YouTube Short</div>
                                      <div className="text-gray-500 text-sm font-medium">Formato Vertical 9:16 (Rápido)</div>
                                    </div>
                                  </label>
                                  
                                  <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.videoType === 'video' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <input type="radio" name="videoType" value="video" className="hidden" checked={formData.videoType === 'video'} onChange={(e) => setFormData({...formData, videoType: e.target.value})} />
                                    <div className="text-3xl mr-4">💻</div>
                                    <div>
                                      <div className="font-extrabold text-gray-900 text-lg">Video Normal</div>
                                      <div className="text-gray-500 text-sm font-medium">Formato Horizontal 16:9 (Detallado)</div>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Botón Submit */}
                          <div className="pt-6">
                            <button 
                              type="submit" disabled={publishing} 
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-6 rounded-[2rem] shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_20px_50px_rgba(22,163,74,0.5)] transition-all text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-2 flex items-center justify-center gap-4"
                            >
                              {publishing ? (
                                <>
                                  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Procesando con IA...
                                </>
                              ) : (
                                <>🚀 PUBLICAR Y ENVIAR AL MOTOR DE VIDEOS (-1 Crédito)</>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA: HISTORIAL */}
            {activeTab === 'historial' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 md:p-12 animate-fade-in">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-extrabold text-gray-900">Tus Publicaciones</h3>
                    <p className="text-gray-500 font-medium mt-2">Seguimiento en tiempo real de tu contenido.</p>
                  </div>
                  <button onClick={() => fetchHistory(user.googleId)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl transition">
                    ↻ Actualizar
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-500 font-bold text-xl">Sincronizando con los servidores...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">👻</div>
                    <p className="text-gray-800 font-bold text-2xl mb-2">Aún no hay publicaciones</p>
                    <p className="text-gray-500 mb-6">Tu historial está limpio. Es un gran momento para crear tu primera noticia.</p>
                    <button onClick={() => setActiveTab('estudio')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition">
                      Ir al Estudio Creativo
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {history.map((article) => (
                      <div key={article._id} className="bg-gray-50 hover:bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6">
                        {/* Fecha visual */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center min-w-[100px] shadow-sm">
                          <div className="text-sm font-bold text-gray-400 uppercase">{new Date(article.publishDate || article.createdAt).toLocaleString('default', { month: 'short' })}</div>
                          <div className="text-3xl font-black text-gray-900">{new Date(article.publishDate || article.createdAt).getDate()}</div>
                          <div className="text-xs font-bold text-gray-400">{new Date(article.publishDate || article.createdAt).getFullYear()}</div>
                        </div>
                        
                        {/* Info Principal */}
                        <div className="flex-grow text-center md:text-left">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h4>
                          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${article.videoType === 'short' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {article.videoType === 'short' ? '📱 YouTube Short' : '💻 Video Normal'}
                            </span>
                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              {article.status === 'published' ? 'Activo en Web' : 'Procesando'}
                            </span>
                          </div>
                        </div>

                        {/* Botón de Acción */}
                        <div className="shrink-0">
                          <Link href={`/articulo/${article._id}`} className="block bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105 shadow-md">
                            Ver Publicación ↗
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Wrapper Principal con el Provider de Google
export default function Miembros() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return <div className="p-20 text-center text-red-500 font-bold text-2xl">⚠️ Faltan las credenciales de Google en el archivo .env.local</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <MiembrosDashboard />
    </GoogleOAuthProvider>
  );
}