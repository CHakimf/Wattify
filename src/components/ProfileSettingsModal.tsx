import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, LogOut, Database, Key, RefreshCw, AlertTriangle, ShieldCheck, Mail, CreditCard, Settings as SettingsIcon, Save, Check, Activity, Edit3, Image as ImageIcon } from 'lucide-react';
import { User, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Settings, MonitoringData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onResetData: () => void;
  onShowTutorial: () => void;
  onSaveConfig: () => void;
  isAutoSyncEnabled: boolean;
  toggleAutoSync: () => void;
  settings: Settings;
  onSaveSettings: (settings: Partial<Settings>) => void;
  history?: any[];
  monitoring?: MonitoringData;
}

export function ProfileSettingsModal({ isOpen, onClose, user, onLogout, onResetData, onShowTutorial, onSaveConfig, isAutoSyncEnabled, toggleAutoSync, settings, onSaveSettings, history = [], monitoring }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'firebase' | 'danger'>('profile');
  const [apiKey, setApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [showConfigSaved, setShowConfigSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('wattify_firebase_api_key') || '');
      setDbUrl(localStorage.getItem('wattify_firebase_db_url') || '');
      setLocalSettings(settings);
      setDisplayNameInput(user?.displayName || '');
    }
  }, [isOpen, settings, user]);

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('wattify_firebase_api_key', apiKey);
    localStorage.setItem('wattify_firebase_db_url', dbUrl);
    setShowConfigSaved(true);
    onSaveConfig();
    setTimeout(() => setShowConfigSaved(false), 3000);
  };
  
  const AVATAR_TEMPLATES = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Annie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cleo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Robot',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Retro'
  ];

  const handleUpdateAvatar = async (url: string) => {
    if (!auth.currentUser) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(auth.currentUser, {
        photoURL: url
      });
      setShowAvatarSelect(false);
      setCustomAvatarUrl('');
      // Force reload to reflect photoURL changes globally
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateName = async () => {
    if (!auth.currentUser) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayNameInput
      });
      setIsEditingName(false);
      // Force reload to reflect displayName changes globally
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile name:', error);
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveAppConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  const executeReset = () => {
    onResetData();
    setShowResetConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Pengaturan Akun & Profil
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/20 dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center py-6">
              <div className="relative group mb-3">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <button 
                  onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow border-2 border-white dark:border-slate-900 hover:bg-blue-700 transition z-10"
                  title="Ubah Foto Profil"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              <AnimatePresence>
                {showAvatarSelect && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden mb-4"
                  >
                    <div className="p-3 border flex flex-col gap-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm relative z-20">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" /> Template Avatar
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {AVATAR_TEMPLATES.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => handleUpdateAvatar(url)}
                            disabled={isUpdatingProfile}
                            className={`relative rounded-full hover:scale-110 transition shrink-0 ${user?.photoURL === url ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' : ''}`}
                          >
                            <img src={url} alt={`Avatar ${i+1}`} className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full" />
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2 mb-1">
                        URL Custom
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="url"
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2 py-1.5 rounded-lg text-xs border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                        />
                        <button
                          onClick={() => handleUpdateAvatar(customAvatarUrl)}
                          disabled={!customAvatarUrl || isUpdatingProfile}
                          className="w-full py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-center">
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {user?.displayName || "Pengguna"}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                <UserIcon className="w-4 h-4" />
                Profil Pengguna
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                <SettingsIcon className="w-4 h-4" />
                Pengaturan
              </button>
              <button
                onClick={() => setActiveTab('firebase')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'firebase' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                <Database className="w-4 h-4" />
                Koneksi ESP32
              </button>
              <button
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'danger' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                Manajemen Data
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Informasi Akun</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nama Tampilan</p>
                        {isEditingName ? (
                          <div className="flex gap-2 w-full mt-1">
                            <input
                              type="text"
                              value={displayNameInput}
                              onChange={(e) => setDisplayNameInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                              placeholder="Masukkan nama"
                              autoFocus
                            />
                            <button
                              onClick={handleUpdateName}
                              disabled={isUpdatingProfile}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingName(false);
                                setDisplayNameInput(user?.displayName || '');
                              }}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {user?.displayName || 'Belum diatur'}
                            </p>
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="text-blue-600 text-sm font-medium hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Utama</p>
                        <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status Akun</p>
                        <p className="font-medium text-slate-900 dark:text-white">Terverifikasi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pengaturan Aplikasi</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Atur tarif listrik dan batas konsumsi harian di sini.
                  </p>
                </div>

                <form onSubmit={handleSaveAppConfig} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tarif Listrik (Rp/kWh)
                    </label>
                    <input
                      type="number"
                      value={localSettings.tariffPerKwh}
                      onChange={(e) => setLocalSettings({ ...localSettings, tariffPerKwh: Number(e.target.value) })}
                      className="block w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                    <p className="text-xs text-slate-500 mt-1">Digunakan untuk estimasi tagihan listrik pada dashboard.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Batas Konsumsi Harian (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={localSettings.dailyEnergyGoal || 0}
                      onChange={(e) => setLocalSettings({ ...localSettings, dailyEnergyGoal: Number(e.target.value) })}
                      className="block w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                    <p className="text-xs text-slate-500 mt-1">Atur target penggunaan energi harian untuk memantau performa penghematan.</p>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSettingsSaved}
                      className={`px-6 py-2.5 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                        isSettingsSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSettingsSaved ? (
                        <>
                          <Check className="h-4 w-4" />
                          Tersimpan!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Simpan Pengaturan
                        </>
                      )}
                    </button>
                    <AnimatePresence>
                      {isSettingsSaved && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium text-green-600 dark:text-green-400"
                        >
                          Pengaturan Berhasil Disimpan!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'firebase' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Kredensial ESP32 Custom</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Jika Anda memiliki Firebase Realtime Database sendiri untuk ESP32, Anda dapat menyambungkannya dengan memasukkan API Key dan URL di bawah ini.
                  </p>
                </div>

                <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Firebase API Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Firebase Database URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Database className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                        placeholder="https://yourapp-default-rtdb.firebaseio.com"
                        value={dbUrl}
                        onChange={(e) => setDbUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                      Simpan Konfigurasi
                    </button>
                    <AnimatePresence>
                      {showConfigSaved && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium text-green-600 dark:text-green-400"
                        >
                          Disimpan!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Manajemen Data</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Pengaturan sinkronisasi dan tindakan tingkat lanjut.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">Auto Sync Firebase</h4>
                    <button
                      onClick={toggleAutoSync}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isAutoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isAutoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Otomatis mengambil pembaruan data secara real-time dari Firebase. Matikan jika Anda ingin menghemat penggunaan kuota/bandwidth, atau untuk menjeda perubahan grafik sementara waktu.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 mt-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Reset Semua Data Akun</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Menghapus seluruh riwayat grafik, metrik konsumsi, dan me-reset odometer kWh perangkat menuju posisi awal. Data tidak dapat dipulihkan.
                  </p>
                  
                  {showResetConfirm ? (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-800 shadow-sm animate-in fade-in zoom-in-95">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Anda yakin?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={executeReset}
                          className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm shadow-md shadow-red-500/20"
                        >
                          Ya, Reset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Data (Factory Reset)
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t dark:border-slate-800">
                  <button
                    onClick={() => {
                      onClose();
                      onShowTutorial();
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                  >
                    Tampilkan Tutorial Awal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
