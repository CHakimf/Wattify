/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { useFirebaseData } from './hooks/useFirebaseData';

export default function App() {
  const { user, isLoading } = useFirebaseData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Menghubungkan ke Wattify...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
