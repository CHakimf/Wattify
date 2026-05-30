import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X, Copy, CheckCircle2, ChevronRight, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FirmwarePromptModal({ isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const promptText = `Halo AI, tolong buatkan saya kode firmware lengkap untuk ESP32 menggunakan Arduino IDE (C++). Firmware ini ditujukan untuk platform smart home monitoring kelistrikan bernama "Wattify".

Berikut adalah spesifikasi hardware dan library yang perlu digunakan:
1. **Board**: ESP32
2. **Sensor Kelistrikan**: PZEM-004T v3.0 (Gunakan library PZEM004Tv30)
3. **Module Relay**: 4 Channel (Active Low / Active High, tolong berikan macro agar mudah diubah)
4. **Firebase**: Firebase ESP Client library (oleh Mobizt) untuk Realtime Database
5. **WiFi & OTA**: WiFiManager (untuk fallback AP) dan ArduinoOTA (opsional jika muat)

### Struktur Firebase Realtime Database
PENTING: Struktur database menggunakan hierarchical root nodes. Ganti UID pengguna secara dinamis, atau gunakan struktur flat root bergantung pada path \`BASE_PATH\` yang ditentukan.

**1. WRITE (Data yang harus dikirim ESP32 ke Firebase setiap 3-5 detik):**
**A. \`\${BASE_PATH}/monitoring\` (Data Realtime IoT)**
- \`voltage\` (float): Tegangan dari PZEM (Volt)
- \`current\` (float): Arus dari PZEM (Ampere)
- \`power\` (float): Daya aktif dari PZEM (Watt)
- \`energy\` (float): Energi dari PZEM (kWh)
- \`frequency\` (float): Frekuensi dari PZEM (Hz)
- \`pf\` (float): Power Factor dari PZEM
- \`wifi_rssi\` (int): Sinyal WiFi (WiFi.RSSI())
- \`esp_temp\` (float): Suhu internal ESP32 (jika memungkinkan, baca dari sensor internal)
- \`free_heap\` (int): ESP.getFreeHeap()
- \`heap_percent\` (float): Persentase heap tersisa
- \`uptime_s\` (long): milis() / 1000
- \`pzem_ok\` (bool): Status apakah PZEM berhasil terbaca atau tidak
- \`timestamp\` (long): Waktu Epoch (jika memungkinkan dari NTP)

**B. \`\${BASE_PATH}/system\` (Data Sistem ESP32)**
- \`device_name\` (string): Nama perangkat (misal: "Wattify-ESP32")
- \`ip\` (string): Alamat IP Lokal setelah connect WiFi
- \`uptime_str\` (string): Format string "0h 1m 21s"
- \`wifi_quality\` (int): Kualitas sinyal wifi 0-100%
- \`online\` (bool): Selalu update ke true saat idle loop
- \`firebase_info_connected\` (bool): Mengikuti trigger .info/connected dari Firebase
- \`rssi\` (int): WiFi.RSSI()
- \`ssid\` (string): Nama WiFi terkoneksi saat ini
- \`last_seen_uptime_s\` (long): milis() / 1000
- \`esp_temp\`, \`free_heap\`, \`heap_percent\` (sama dengan fitur di monitoring)
- **Tuliskan daftar WiFi yang tersedia saat boot ke** \`\${BASE_PATH}/system/available_networks\` (array string dari SSID)

**2. READ (Data yang harus dilistening/stream dari Firebase):**
**A. \`\${BASE_PATH}/control\`**
- \`relay1\`, \`relay2\`, \`relay3\`, \`relay4\` (bool) - Mengontrol GPIO masing-masing relay. PENTING: Perbarui state GPIO fisik secara instan saat node ini berubah!

**B. \`\${BASE_PATH}/settings\`**
- \`threshold\` (float): Batas daya aktif maksimum (Watt) untuk proteksi/Cutoff
- \`autoCutoff\` (bool): Jika true, fitur proteksi aktif
- \`relaySchedules\` (object JSON): Terdapat node \`relay1\`, \`relay2\`, dst. dengan child -> \`enabled\` (bool), \`onTime\` (string "HH:MM"), \`offTime\` (string "HH:MM"). WAJIB di-handle logika schedule di device mengandalkan waktu dari NTP Client.

**C. \`\${BASE_PATH}/system\`**
- Listen pada node ini untuk pemicu/trigger (cek timestamp/value):
  - \`reboot\`: Jika divalidasi mendapat token baru, jalankan \`ESP.restart()\`
  - \`factory_reset\`: Jika mendapat timestamp baru, hapus konfigurasi WiFi (misal \`wifiManager.resetSettings()\`) kemudian jalankan \`ESP.restart()\` (untuk masuk ke mode AP kembali).
  - \`reset_energy\`: Jika mendeteksi value timestamp baru, jalankan perintah reset energi pada object PZEM
  - \`wifi_config/ssid\` & \`wifi_config/password\`: Info config WiFi baru, coba reconnect, jika gagal kembali gunakan SSID sebelumnya.
- Jadikan node \`\${BASE_PATH}/system/online\` sebagai OnDisconnect agar otomatis diset false bila device terputus dari Firebase server.

### Logika Proteksi & Automasi Lanjutan:
Di dalam \`loop()\`, jalankan pengecekan terus menerus (tiap 500ms atau non-blocking \`millis()\`).

**1. Proteksi Auto Cut-off**
Jika \`settings.autoCutoff\` bernilai \`true\` dan \`monitoring.power > settings.threshold\`:
- Matikan SEMUA Relay (ubah status pin relay ke OFF / LOW atau HIGH tegantung macro).
- Tulis kembali status 4 relay ke OFF (\`false\`) di Firebase pada path \`\${BASE_PATH}/control/relayX\` agar UI aplikasi ikut tersinkronisasi.

**2. Penjadwalan Relay (NTP Time)**
- Gunakan \`NTPClient\` untuk mengambil waktu saat ini (\`HH:MM\`), dan sync tiap beberapa waktu.
- Lakukan looping pada \`settings.relaySchedules\` untuk setiap relay (\`relay1\`...\`relay4\`).
- Jika \`enabled\` bernilai \`true\`: Cek apakah jam & menit sekarang sama persis dengan string \`onTime\`. Jika iya, ON kan relay fisik dan push log update state ke Firebase \`control/relayX\`. Sama halnya dengan \`offTime\` untuk OFF. Pastikan ditambahkan flag/debounce agar relay tidak dion-off berulang-ulang pada menit yang sama.

### Kebutuhan Tambahan:
1. Tolong berikan struktur OOP atau modul fungsi yang rapi dan non-blocking (gunakan \`millis()\`).
2. Terapkan logika auto reconnect Firebase jika terputus/disconnected.
3. Berikan baris statis dan komentar pada bagian deklarasi Firebase Database URL & API Key, letakkan di global variable atas!
4. Sediakan inisialisasi PZEM pada pin hardware serial (contoh: RX2/TX2).

Tolong berikan full kodenya utuh misal \`main.cpp\` / \`sketch.ino\`, jangan sepotong-sepotong agar saya kopas langsung jalan!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([promptText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "prompt_esp32_wattify.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prompt Firmware ESP32</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Salin prompt ini ke AI favorit Anda (Gemini, ChatGPT, Claude) untuk mendapatkan kode firmware</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 font-mono text-sm">
          <div className="bg-slate-900 p-6 rounded-2xl text-slate-300 shadow-inner overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{promptText}</pre>
          </div>
        </div>

        <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .txt
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl border-2 font-bold transition-all ${
              copied 
                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' 
                : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Berhasil Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Salin Prompt
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
