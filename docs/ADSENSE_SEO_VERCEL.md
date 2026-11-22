# LoanLens: publicación, SEO y AdSense (Vercel)

**Estado:** guía de configuración. Nada de esta guía implica aprobación por parte de AdSense ni sustituye una revisión legal/de privacidad.

## 1. Antes de activar anuncios

1. Comprueba el **dominio exacto** en Vercel > Project > Settings > Domains. No confundas `myloanlens.vercel.app` y `myloadlens.vercel.app`.
2. Usa **un único dominio canónico** en producción. Para un proyecto con ingresos, es recomendable un dominio propio. Revisa los requisitos de AdSense para el dominio antes de solicitar revisión.
3. **Vercel Hobby está limitado a uso personal no comercial**. Para anuncios, usa un plan que permita uso comercial o un alojamiento adecuado, como Cloudflare Pages (respetando sus condiciones). No actives publicidad en Hobby.
4. Si el titular de AdSense es menor de 18 años, **la cuenta debe registrarla una persona adulta responsable usando su propia cuenta de Google**, conforme a las condiciones de AdSense.
5. Publica contenidos originales útiles, los métodos de cálculo, referencias primarias verificadas y las páginas de confianza. `about`, `contact` y `editorial-policy` están en estado `draft` y requieren información editorial real antes de publicar. Nunca inventes un autor ni un contacto.

## Identificadores reales ya integrados

- **Editor:** `ca-pub-8177969374546909`.
- **Unidad adaptable debajo de resultados:** `8951943585`.
- Estos valores son públicos y ya están configurados como valores por defecto en `src/lib/site.ts` y `src/components/AdSlot.astro` (además de `.env.example`). No pegues otra copia del script HTML de Google: el proyecto ya prepara una única carga diferida a través del módulo de consentimiento.
- Google solo mostrará anuncios reales cuando el sitio esté aprobado y se cumplan las preferencias de consentimiento. Si `PUBLIC_SITE_URL` no está configurado, los anuncios permanecerán desactivados y el sitio se marcará `noindex`.

## 2. Configuración de Vercel (Production)

En Project > Settings > Environment Variables introduce:

| Nombre | Ejemplo | Notas |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | `https://TU-DOMINIO-REAL` | Exactamente el dominio HTTPS de producción. Obligatorio para permitir indexación. |
| `PUBLIC_SITE_NAME` | `LoanLens` | Nombre de marca. |
| `PUBLIC_ADSENSE_CLIENT` | `ca-pub-8177969374546909` | Ya incorporado como valor público por defecto; la variable es opcional si usas esta cuenta. |
| `PUBLIC_ADSLOT_RESULTS` | `1234567890` | ID numérico del bloque situado bajo los resultados. |
| `PUBLIC_ADSLOT_ARTICLE` | `2345678901` | Bloque bajo contenido editorial, cuando exista una inserción. |
| `PUBLIC_ADSLOT_SIDEBAR` | `3456789012` | Bloque lateral para guías de escritorio. |
| `PUBLIC_GOOGLE_CMP_URL` | `https://fundingchoicesmessages.google.com/...` | **URL exacta** del script de Privacy & messaging de la cuenta, una vez configurado, publicado y probado el mensaje. |
| `PUBLISH_DRAFTS` | `false` | Mantener en false en producción. |
| `STRICT_PUBLISH` | `true` | Recomendado una vez completados los datos editoriales. |

**No pegues valores de ejemplo en producción.** Tras guardar variables, realiza un nuevo despliegue de Production.

Atención: si `PUBLIC_SITE_URL` está ausente o termina en `.example`, LoanLens produce etiquetas `noindex`, robots.txt que bloquea el rastreo, y no sirve los anuncios. Lo implementa `src/lib/site.ts`.

## 3. Crear bloques en AdSense

En **Anuncios > Por bloque de anuncios > Anuncios de display**, crea bloques **Adaptables** (no tamaño fijo 728x90):

- `LoanLens - Below Results`: ID para `PUBLIC_ADSLOT_RESULTS`.
- `LoanLens - In Article`: ID para `PUBLIC_ADSLOT_ARTICLE`, si hay espacio editorial suficiente.
- `LoanLens - Guide Sidebar`: ID para `PUBLIC_ADSLOT_SIDEBAR`, para pantallas grandes.

Al crear cada bloque, copia **solo** los números de `data-ad-slot` a su variable. El valor `data-ad-client` (`ca-pub-...`) va en `PUBLIC_ADSENSE_CLIENT`. **No copies el script completo en cada componente:** el proyecto ya cuenta con `AdSlot.astro` y un cargador en `public/ads-consent.js`.

Evita anuncios junto a botones, entradas o controles de la calculadora. No actives anuncios automáticos encima de estas posiciones sin verificar que no deterioran la experiencia.

## 4. Conexión, revisión, consentimiento y ads.txt

1. En **AdSense > Sitios**, añade el dominio definitivo. Enlaza el sitio mediante la metaetiqueta de AdSense: `src/layouts/Base.astro` ya genera `google-adsense-account` cuando el identificador es válido. Comprueba en **Ver código fuente** del sitio publicado.
2. Solicita revisión desde AdSense y comprueba si su estado pasa a **Ready / Listo**. Crear bloques no equivale a tener aprobación.
3. En **AdSense > Privacidad y mensajes > Normativa europea**, configura y publica un mensaje mediante la CMP certificada de Google o una alternativa certificada compatible con TCF. Debe permitir gestionar las decisiones de consentimiento y revocarlas. Configura e implementa correctamente el script de esa CMP. No actives publicidad sin verificar el flujo de consentimiento aplicable.
4. La integración actual carga anuncios solo cuando se verifica el estado del consentimiento y existen variables válidas. Hay que probar aceptación, rechazo, revocación, navegación, modo incógnito, móvil y escritorio; **no des por hecho que el sistema está conforme solo porque existe un banner**.
5. `src/pages/ads.txt.ts` genera automáticamente `/ads.txt` cuando `PUBLIC_ADSENSE_CLIENT` es válido y el sitio es indexable. No dupliques `ads.txt` dentro de `public`. Comprueba `https://TU-DOMINIO-REAL/ads.txt`; debe mostrar:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
6. Comprueba **Ads > Sites** en AdSense para verificar revisión y estado de ads.txt; el rastreo puede tardar.

## 5. SEO y confianza

- Registra el dominio correcto en Google Search Console y envía `https://TU-DOMINIO-REAL/sitemap-index.xml`.
- Comprueba `/robots.txt`, la etiqueta canonical, H1 único, metadatos Open Graph y enlaces internos.
- Revisa los datos financieros sensibles con **fuentes oficiales**, fechas verificadas, supuestos transparentes, ejemplos reproducibles y política de correcciones. No apruebes `draft` sin revisar el contenido.
- Publica información real sobre el responsable del sitio, canal de contacto, política editorial, privacidad y publicidad. Incluye restricciones de responsabilidad y separación clara de anuncios y estimaciones.
- Utiliza Lighthouse/PageSpeed y Search Console para validar CWV, indexación, SEO, móvil y accesibilidad. No esperes rankings inmediatos solo por añadir metaetiquetas.
- Las páginas de LoanLens están en **inglés y orientadas a préstamos estudiantiles de Estados Unidos**: conserva esa intención de búsqueda y la exactitud de la terminología.

## 6. Comandos PowerShell

```powershell
git clone https://github.com/aritzgsc/LoanLens.git
cd LoanLens
git switch main
git pull --ff-only
git switch feat/warm-design-adsense-seo-2026
npm ci
npm run lint
npm run typecheck
npm test
npm run verify-data
npm run build
npm run check:links
npm run dev
```

Tras revisar la PR, haz merge desde GitHub. Si deseas hacerlo con GitHub CLI (una vez revisados los checks):

```powershell
gh pr list
gh pr view --web
# Después de la aprobación y de que los checks pasen:
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only
```

En Vercel debe estar conectado el repositorio a la rama `main`, con build `npm run build` y directorio de salida `dist`. Al hacer merge, verifica el despliegue de producción.

## 7. Condiciones de aceptación

- [ ] Dominio correcto y consistente en Search Console, AdSense y `PUBLIC_SITE_URL`
- [ ] Alojamiento permite uso comercial
- [ ] El sitio público no tiene `noindex` accidental
- [ ] About, Contact y Editorial policy verificadas y publicadas
- [ ] Validación de fórmulas y contenido financiero superada
- [ ] `/robots.txt`, `/sitemap-index.xml`, `/ads.txt` funcionan
- [ ] Mensaje europeo y decisiones de consentimiento comprobados
- [ ] Sin anuncios entre campos y resultados ni desplazamientos de diseño graves
- [ ] Tests, typecheck, lint, build, links y auditoría de navegador correctos
- [ ] Estado en AdSense: **Ready / Listo** antes de esperar anuncios reales

## Fuentes oficiales

- [Crear un bloque de display](https://support.google.com/adsense/answer/9274025)
- [Conectar un sitio a AdSense](https://support.google.com/adsense/answer/7584263)
- [Requisitos de consentimiento para EEE, Reino Unido y Suiza](https://support.google.com/adsense/answer/13554116)
- [Preparar ads.txt](https://support.google.com/adsense/answer/12171612)
- [Google Search Central: contenido útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Vercel Hobby](https://vercel.com/docs/plans/hobby)
