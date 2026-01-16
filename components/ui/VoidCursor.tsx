'use client'

import { useEffect, useRef } from 'react'

export function VoidCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!cursorRef.current) return
            cursorRef.current.style.left = `${e.clientX}px`
            cursorRef.current.style.top = `${e.clientY}px`

            if (Math.random() > 0.6) {
                const particle = document.createElement('div')
                const angle = Math.random() * Math.PI * 2
                const distance = 40
                const startX = e.clientX + Math.cos(angle) * distance
                const startY = e.clientY + Math.sin(angle) * distance

                particle.style.position = 'fixed'
                particle.style.left = `${startX}px`
                particle.style.top = `${startY}px`
                particle.style.width = '4px'
                particle.style.height = '4px'
                particle.style.background = '#ff006e'
                particle.style.borderRadius = '50%'
                particle.style.pointerEvents = 'none'
                particle.style.zIndex = '9998'

                document.body.appendChild(particle)

                let lifetime = 500
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                const animateVoid = () => {
                    const ratio = 1 - lifetime / 500

                    particle.style.left = `${startX + dx * ratio}px`
                    particle.style.top = `${startY + dy * ratio}px`
                    particle.style.opacity = String((lifetime / 500) * 0.8)

                    lifetime -= 16
                    if (lifetime > 0) {
                        requestAnimationFrame(animateVoid)
                    } else {
                        particle.remove()
                    }
                }
                animateVoid()
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <>
            <style jsx global>{`
        @keyframes voidPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 8px #ff006e;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            box-shadow: 0 0 20px #ff006e, inset 0 0 8px rgba(255, 0, 110, 0.5);
          }
        }
        .void-cursor {
          pointer-events: none;
          position: fixed;
          width: 24px;
          height: 24px;
          left: 0;
          top: 0;
          border: 2px solid #ff006e;
          border-radius: 50%;
          z-index: 9999;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.2), transparent);
          animation: voidPulse 1.5s ease-in-out infinite;
        }
      `}</style>
            <div ref={cursorRef} className="void-cursor" />
        </>
    )
}
