# La Quinta Pata

Juego presencial de debate, argumentación y detección de falacias construido con
Next.js.

## Desarrollo local

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`. Sin Redis las salas se conservan solo en la memoria
del proceso, lo que alcanza para desarrollo local.

## Variables de producción

Copiar `.env.example` y configurar:

```dotenv
LA_QUINTA_PATA_SESSION_SECRET=un-valor-aleatorio-largo
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

También se aceptan los nombres `KV_REST_API_URL` y `KV_REST_API_TOKEN`.

## Validación

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

Consulta [technical_audit_results.md](./technical_audit_results.md) para el estado,
los riesgos pendientes y el plan de salida a producción.
