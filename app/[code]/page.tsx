import { redirect } from 'next/navigation';

export default function ShortCodeRedirect({ params }: { params: { code: string } }) {
    const { code } = params;
    // Si es una ruta que no existe (como un código de 4 letras de la sala que escriben directo en la URL)
    // los redirigimos a la pantalla de unirse a la sala.
    redirect(`/join/${code.toUpperCase()}`);
}

