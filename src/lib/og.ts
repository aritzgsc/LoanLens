import sharp from 'sharp';
import { siteName } from './site';
const escape = (s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function image(title:string) {
  const lines:string[]=[];
  for(const word of title.split(/\s+/)) {
    const last=lines.at(-1);
    if(last && last.length+word.length<31) lines[lines.length-1]=last+' '+word;
    else lines.push(word);
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#eaf8f1"/><rect x="55" y="55" width="1090" height="520" rx="32" fill="#ffffff" stroke="#bddbd1" stroke-width="2"/>
    <path d="M740 480 L823 395 L889 425 L1036 267" stroke="#79c8ab" stroke-width="9" opacity=".55" fill="none"/>
    <text x="105" y="150" fill="#07685a" font-size="33" font-family="sans-serif">${escape(siteName)}</text>
    <text fill="#132f32" font-size="64" font-weight="bold" font-family="sans-serif">${lines.slice(0,4).map((line,i)=>`<tspan x="105" y="${253+i*80}">${escape(line)}</tspan>`).join('')}</text>
  </svg>`;
  return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}
export async function icon(size:number) {
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="#07685a"/><path d="M15 47V19m0 28h34M22 37l9-8 7 5 11-13" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/></svg>';
  return new Uint8Array(await sharp(Buffer.from(svg)).resize(size,size).png().toBuffer());
}
