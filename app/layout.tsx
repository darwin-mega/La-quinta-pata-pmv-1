import type { Metadata, Viewport } from 'next';
import './globals.css';
import SoundIdentity from '@/components/SoundIdentity';
import Watermark from '@/components/Watermark';

export const metadata: Metadata = {
    title: 'La Quinta Pata - Debate y Argumentación',
    description: 'Un juego presencial de debate, argumentación y detección de falacias.',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'La Jaula'
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#121319',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body>
                <Watermark />
                <SoundIdentity />
                {children}
            </body>
        </html>
    );
}
