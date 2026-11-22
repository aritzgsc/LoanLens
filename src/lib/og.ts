import sharp from 'sharp';
import { siteName } from './site';
const escape = (s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function image(title:string) {
  const lines:string[]=[];
  for(const word of title.split(/\s+/)) {
    const last=lines.at(-1);
    if(last && last.length + 1 + word.length <= 22) lines[lines.length-1]=last+' '+word;
    else lines.push(word);
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eaf8f0"/><stop offset=".7" stop-color="#ffffff"/><stop offset="1" stop-color="#f7f7ee"/></linearGradient></defs>
    <rect width="1200" height="630" fill="#fafcfb"/>
    <rect x="45" y="45" width="1110" height="540" rx="34" fill="url(#bg)" stroke="#dbeae0" stroke-width="2"/>
    <circle cx="1035" cy="115" r="140" fill="#d9f3e2" opacity=".65"/>
    <circle cx="1070" cy="480" r="175" fill="#e8f4e9" opacity=".7"/>
    <path d="M765 482 L845 410 L920 435 L1050 298" stroke="#79bca1" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".55" fill="none"/>
    <circle cx="1050" cy="298" r="13" fill="#0b7668" opacity=".7"/>
    <rect x="92" y="100" width="10" height="42" rx="5" fill="#0b7668"/>
    <text x="120" y="134" fill="#0b7668" font-size="31" font-weight="700" font-family="sans-serif">${escape(siteName)}</text>
    <text fill="#203b34" font-size="58" font-weight="700" letter-spacing="-1" font-family="sans-serif">${lines.slice(0,4).map((line,i)=>`<tspan x="105" y="${244+i*77}">${escape(line)}</tspan>`).join('')}</text>
  </svg>`;
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}
export async function icon(size:number) {
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#086b60"/><path d="M15 47V19m0 28h34M22 37l9-8 7 5 11-13" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/><circle cx="49" cy="21" r="3" fill="#e3f9e9"/></svg>';
  return new Uint8Array(await sharp(Buffer.from(svg)).resize(size,size).png().toBuffer());
}
