"use client";

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logoImg from '../img/logo.jpeg';

export default function Watermark() {
    const pathname = usePathname();

    // No mostrar la marca de agua en el inicio o de lo contrario choca con el logo gigante principal.
    if (pathname === '/') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '-2rem',
            right: '-2rem',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: -1,
            transform: 'rotate(-10deg)',
            filter: 'grayscale(100%) blur(1px)'
        }}>
            <Image
                src={logoImg}
                alt="Watermark"
                width={350}
                style={{ height: 'auto', maxWidth: '100%' }}
                priority
            />
        </div>
    );
}
