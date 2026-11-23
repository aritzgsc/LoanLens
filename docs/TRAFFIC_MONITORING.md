# LoanLens — medir tráfico antes de comprar un dominio

**Inicio:** 2026-11-23 · **Canónica actual:** https://myloanlens.vercel.app/

## Estado de la integración

- Vercel Web Analytics `@vercel/analytics@2.0.1` montado **una vez** en el layout compartido de Astro (`src/layouts/Base.astro`), en modo producción; no se registran eventos personalizados de formularios o cálculos.
- Seguimiento por páginas y procedencia, sin cookies de seguimiento según la [documentación de Vercel](https://vercel.com/docs/analytics/privacy-policy).
- Se ha actualizado `/privacy/` para informar de las métricas agregadas. No se ha activado AdSense ni Google Analytics.
- Vercel requiere activar **Web Analytics** en el dashboard del proyecto `loan-lens` para ver el tráfico. La existencia del componente no demuestra por sí sola que haya visitas reales.
- Si aparece una pantalla «Get Started», visitar páginas en producción desde un navegador sin bloqueadores después del despliegue y consultar la pestaña Network. La petición de `/view` puede estar bajo un **prefijo único** en la versión 2 del SDK.

## En Google Search Console (propiedad exacta)

1. El sitemap presentado es `https://myloanlens.vercel.app/sitemap-index.xml`. Confirmar estado **Correcto** y comprobar que el sitemap incluye las 36 URL públicas.
2. En **Inspección de URLs**, comprobar como mínimo Home, Calculator, Tools, Guides y una guía concreta. «URL disponible para Google» no equivale a «URL indexada».
3. En **Indexación → Páginas**, observar «Indexadas», «Rastreadas, actualmente sin indexar» y «Descubiertas, actualmente sin indexar». Priorizar errores o exclusiones inesperadas, no URL canónicas redirigidas intencionalmente.
4. En **Rendimiento → Resultados de búsqueda**, revisar impresiones, clics, CTR, consultas y páginas cada semana; pueden pasar días o semanas antes de que haya datos. No asumir visitas orgánicas basándose únicamente en pruebas de navegador o visitas propias.
5. No pedir indexación en masa continuamente ni comprar un dominio solo porque el sitemap muestre «Correcto». Confirmar primero descubrimiento, tendencias y utilidad.

## Rutina de seguimiento

| Intervalo | Vercel Web Analytics | Search Console |
| --- | --- | --- |
| Primer día | Confirmar la carga del script y peticiones de página; anotar visitas de prueba como tales | Verificar sitemap y la propiedad |
| Cada 2–3 días | Visitantes, páginas más vistas, referencias | Cobertura e incidencias de rastreo |
| Semanal | Tráfico total, páginas de entrada, referencias y origen | Impresiones, clics, consultas, CTR, indexadas |
| Tras 3–4 semanas | Evaluar usuarios externos, no tests internos | Ver si páginas relevantes generan impresiones y mejorar contenidos con evidencia |

**Interpretación:** Vercel Analytics cuenta vistas cargadas en navegador; Search Console informa sobre visibilidad en Google. No son cifras equivalentes, el tráfico de prueba contamina métricas y los bloqueadores pueden impedir recuentos.

**Antes de activar publicidad:** verificar términos comerciales del alojamiento, requisitos de AdSense (incluida la edad mínima del titular) y tratamiento de privacidad/cumplimiento aplicable. No se necesitan ahora para medir visitas anónimas.
