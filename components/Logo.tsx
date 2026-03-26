import Image from 'next/image';
import logoImg from '../img/logo.jpeg';

export default function Logo({ width = 150, className }: { width?: number, className?: string }) {
    return (
        <Image
            src={logoImg}
            alt="La Quinta Pata Logo"
            width={width}
            className={className}
            style={{ height: 'auto', borderRadius: '4px', maxWidth: '100%', objectFit: 'contain' }}
            priority
        />
    );
}
