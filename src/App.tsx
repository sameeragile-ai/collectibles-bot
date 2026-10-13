import React, { useEffect } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { LiveBoard } from './components/live/LiveBoard';
import { ToastContainer } from './components/common/ToastContainer';
import { useDroplineStore } from './store/useDroplineStore';

export default function App() {
  const { setSidebarOpen, setLiveBoardOpen } = useDroplineStore();

  // Handle responsive resize on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setLiveBoardOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen, setLiveBoardOpen]);

  // Global escape key to close panels if open on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
          setLiveBoardOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSidebarOpen, setLiveBoardOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] text-stone-900 font-sans antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Hero Center Chat */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatContainer />
      </main>

      {/* Right Live Board */}
      <LiveBoard />

      {/* Floating System Toasts */}
      <ToastContainer />
    </div>
  );
}
