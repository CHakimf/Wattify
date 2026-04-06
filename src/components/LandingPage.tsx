import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { Zap, Mail, Lock, LogIn, AlertCircle, Chrome, CheckCircle2, ShieldCheck, BarChart3, Cpu, Smartphone, Globe, Play, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoTutorial } from './VideoTutorial';

export function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password salah. Pastikan Anda menggunakan akun yang sudah terdaftar di Firebase Console.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.');
      } else {
        setError('Terjadi kesalahan saat login: ' + (err.message || 'Silakan coba lagi.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Domain ini belum diizinkan di Firebase Console. Silakan tambahkan domain aplikasi ke "Authorized Domains" di pengaturan Authentication Firebase.');
      } else {
        setError('Gagal login dengan Google. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Monitoring",
      description: "Pantau tegangan, arus, dan daya secara instan dari perangkat ESP32 Anda."
    },
    {
      icon: ShieldCheck,
      title: "Auto Cut-off",
      description: "Lindungi perangkat Anda dengan fitur pemutus arus otomatis saat beban berlebih."
    },
    {
      icon: Globe,
      title: "Akses Di Mana Saja",
      description: "Kelola dan pantau penggunaan energi rumah Anda dari mana saja melalui cloud."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wattify</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fitur</a>
            <a href="#tutorials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tutorial</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tentang</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kontak</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Mulai Sekarang
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-50 md:hidden border-l border-slate-100 dark:border-slate-900 p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wattify</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Fitur', href: '#features' },
                    { label: 'Tutorial', href: '#tutorials' },
                    { label: 'Tentang', href: '#about' },
                    { label: 'Kontak', href: '#contact' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Mulai Sekarang
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section with Split Layout */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Activity className="h-3.5 w-3.5" />
                Smart Energy Monitoring
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                Kendalikan Energi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Lebih Cerdas.</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed">
                Wattify membantu Anda memantau penggunaan listrik secara real-time dari perangkat ESP32. Hemat biaya, amankan perangkat, dan optimalkan konsumsi energi Anda.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Akurasi Tinggi</h3>
                    <p className="text-sm text-slate-500">Data presisi dari sensor PZEM-004T.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Instalasi Mudah</h3>
                    <p className="text-sm text-slate-500">Plug & play dengan firmware ESP32.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-900 dark:text-white">500+ Pengguna</div>
                  <div className="text-slate-500">Telah menghemat energi mereka</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Login Form */}
            <motion.div
              id="login-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-2xl rounded-[40px] -z-10" />
              
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Selamat Datang Kembali</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk untuk melihat dashboard monitoring Anda.</p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                        Ingat saya di perangkat ini
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Masuk ke Dashboard
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Atau</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <Chrome className="h-5 w-5 text-red-500" />
                  Masuk dengan Google
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Fitur Unggulan Wattify</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Solusi lengkap untuk monitoring energi rumah tangga Anda dengan teknologi IoT terkini.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section id="tutorials" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Play className="h-3.5 w-3.5" />
              Video Tutorial
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Pelajari Cara Kerjanya</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Tonton video tutorial kami untuk memulai perjalanan monitoring energi Anda dengan Wattify.
            </p>
          </div>

          <VideoTutorial />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Data Points", value: "1M+" },
              { label: "Uptime", value: "99.9%" },
              { label: "User Saving", value: "25%" },
              { label: "ESP32 Support", value: "All" }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Tentang Wattify</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Wattify adalah platform monitoring energi berbasis IoT yang dirancang untuk memberikan visibilitas penuh terhadap penggunaan listrik Anda. Kami percaya bahwa dengan data yang tepat, setiap rumah tangga dapat berkontribusi pada efisiensi energi global sambil menghemat biaya pengeluaran bulanan.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Dimulai sebagai proyek inovasi untuk memudahkan pemantauan perangkat ESP32, Wattify kini berkembang menjadi solusi komprehensif yang menggabungkan perangkat keras presisi tinggi dengan antarmuka cloud yang intuitif.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1558441719-ffb4d4520a67?auto=format&fit=crop&q=80&w=1000" 
                alt="Smart Home Energy" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Hubungi Kami</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-12">
              Ada pertanyaan tentang instalasi atau ingin bekerja sama? Tim kami siap membantu Anda kapan saja.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                <p className="text-sm text-slate-500">support@wattify.io</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">WhatsApp</h4>
                <p className="text-sm text-slate-500">+62 812-3456-7890</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Lokasi</h4>
                <p className="text-sm text-slate-500">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Wattify</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 Wattify IoT. Dibuat dengan ❤️ untuk efisiensi energi.
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <Smartphone className="h-5 w-5 hover:text-blue-600 transition-colors cursor-pointer" />
            <Cpu className="h-5 w-5 hover:text-blue-600 transition-colors cursor-pointer" />
            <Globe className="h-5 w-5 hover:text-blue-600 transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
