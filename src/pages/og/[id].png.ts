import type { APIRoute } from 'astro';
import { image } from '../../lib/og';
import { visible } from '../../lib/content';
import { toolTitles } from '../../components/Tools';
export async function getStaticPaths() {
  const titles:Record<string,string>={home:'Student loan calculators and college aid comparison',calculator:'RAP calculator',tools:'Student loan tools',guides:'Student loan repayment guides','404':'Page unavailable'};
  for(const [key,tool] of Object.entries(toolTitles)) titles[key]=tool.title;
  for(const entry of await visible()) titles[entry.data.category+'-'+entry.id]=entry.data.title;
  return Object.entries(titles).map(([id,title])=>({params:{id},props:{title}}));
}
export const GET:APIRoute=async ({props})=>new Response(await image(String(props.title)),{headers:{'Content-Type':'image/png'}});
