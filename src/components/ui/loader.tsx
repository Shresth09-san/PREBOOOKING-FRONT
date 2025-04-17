import React, { useEffect, useRef } from 'react';
import Logo from "@/assests/logoR.png"; // Adjust the path as necessary
import gsap from 'gsap';

const Loader: React.FC = () => {
    const logoRef = useRef<HTMLImageElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const linesContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Make sure refs are available
        if (!logoRef.current || !glowRef.current) return;
        
        // Create a timeline for better control
        const timeline = gsap.timeline({
            repeat: -1, // Infinite repeat
            repeatDelay: 0.3
        });
        
        // First beat (stronger)
        timeline.to([logoRef.current, glowRef.current], {
            scale: 2.15,
            opacity: 0.8,
            duration: 0.2,
            ease: "power2.inOut"
        });
        
        // Return to normal
        timeline.to([logoRef.current, glowRef.current], {
            scale: 1,
            opacity: 1,
            duration: 0.15,
            ease: "power2.inOut"
        });
        
        // Second beat (softer)
        timeline.to([logoRef.current, glowRef.current], {
            scale: 1.10,
            opacity: 0.8,
            duration: 0.2,
            ease: "power2.inOut"
        });
        
        // Return to normal again
        timeline.to([logoRef.current, glowRef.current], {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut"
        });
        
        // Animate background lines
        if (linesContainerRef.current) {
            const lines = linesContainerRef.current.querySelectorAll('.bg-line');
            gsap.to(lines, {
                rotation: "+=360",
                duration: (i) => 20 + i * 5, // Different speeds for each line
                repeat: -1,
                ease: "none"
            });
        }
        
        // Cleanup function
        return () => {
            timeline.kill();
        };
    }, []);

    return (
        <div className='bg-black h-screen w-screen flex flex-col items-center justify-center overflow-hidden relative'>
            {/* Background animated lines container */}
            <div ref={linesContainerRef} className="absolute inset-0 -z-10">
                {/* Multiple circular lines with different sizes and speeds */}
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vh] h-[150vh] border border-blue-500/10 rounded-full"></div>
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] border border-blue-400/15 rounded-full"></div>
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vh] h-[90vh] border border-blue-300/20 rounded-full"></div>
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] border border-blue-200/25 rounded-full"></div>
                
                {/* Additional diagonal lines */}
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130vh] h-[130vh] border border-blue-500/10 rounded-full rotate-45"></div>
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vh] border border-blue-400/15 rounded-full rotate-45"></div>
                <div className="bg-line absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vh] h-[70vh] border border-blue-300/20 rounded-full rotate-45"></div>
            </div>

            <div className="relative">
                {/* Logo with heartbeat animation */}
                <img 
                    ref={logoRef}
                    src={Logo} 
                    alt="Loading..." 
                    className="
                        w-16 h-16 
                        xs:w-20 xs:h-20
                        sm:w-24 sm:h-24 
                        md:w-32 md:h-28 
                        lg:w-36 lg:h-32
                        xl:w-40 xl:h-36
                        opacity-90
                        transition-all duration-300
                    " 
                />
                {/* Inner pulsing glow */}
                <div 
                    ref={glowRef}
                    className="absolute inset-0 rounded-full bg-blue-500/30 -z-10"
                ></div>
                {/* Outer expanding ring */}
                <div className="absolute -inset-4 rounded-full animate-ripple bg-blue-400/10 -z-20"></div>
            </div>
            {/* Loading text */}
            {/* <p className="mt-6 text-blue-400 text-sm animate-pulse">Loading...</p> */}
        </div>
    );
};

// Add these custom animations to your tailwind.config.js file:
// extend: {
//   animation: {
//     'ripple': 'ripple 3s ease-out infinite',
//   },
//   keyframes: {
//     ripple: {
//       '0%': { transform: 'scale(0.8)', opacity: '1' },
//       '100%': { transform: 'scale(1.4)', opacity: '0' },
//     },
//   },
// },

export default Loader;

