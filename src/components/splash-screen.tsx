
"use client";

import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

export function SplashScreen() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent transition-opacity duration-500 ease-in-out" style={{ opacity: isMounted ? 1 : 0 }}>
        <div className="text-center animate-fade-in-up">
            <GraduationCap className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold font-headline mt-4">
                MyCampusConnect
            </h1>
        </div>
        <style jsx>{`
            @keyframes fade-in-up {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .animate-fade-in-up {
                animation: fade-in-up 1s ease-out forwards;
            }
        `}</style>
    </div>
  );
}
