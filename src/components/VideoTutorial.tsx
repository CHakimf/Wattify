import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Play, BookOpen, HelpCircle, ExternalLink, Youtube, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
}

const tutorials: TutorialVideo[] = [
  {
    id: '1',
    title: 'Cara Instalasi ESP32 & PZEM-004T',
    duration: '05:20',
    thumbnail: 'https://picsum.photos/seed/esp32/800/450',
    description: 'Panduan langkah demi langkah merakit perangkat monitoring energi Anda sendiri.'
  },
  {
    id: '2',
    title: 'Konfigurasi WiFi & Firebase',
    duration: '03:45',
    thumbnail: 'https://picsum.photos/seed/firebase/800/450',
    description: 'Menghubungkan ESP32 ke internet dan sinkronisasi data ke dashboard Wattify.'
  },
  {
    id: '3',
    title: 'Memahami Dashboard Monitoring',
    duration: '04:15',
    thumbnail: 'https://picsum.photos/seed/dashboard/800/450',
    description: 'Cara membaca grafik, statistik, dan mengontrol relay dari jarak jauh.'
  }
];

export function VideoTutorial() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tutorials.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden group cursor-pointer border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 text-blue-600 fill-blue-600" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{video.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
              Dokumentasi Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Butuh panduan tertulis? Kami menyediakan dokumentasi teknis yang mendalam untuk setiap komponen.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
              Buka Dokumentasi <ExternalLink className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <HelpCircle className="h-5 w-5" />
              Pusat Bantuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Punya pertanyaan atau kendala teknis? Tim dukungan kami siap membantu Anda 24/7.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Hubungi Support <ExternalLink className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-xl">
            <Youtube className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Subscribe Channel YouTube Kami</h3>
            <p className="text-slate-400 text-sm">Dapatkan update tutorial IoT terbaru setiap minggu.</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors">
          Kunjungi Channel
        </button>
      </div>
    </div>
  );
}
