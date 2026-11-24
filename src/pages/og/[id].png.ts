import type { APIRoute } from 'astro';
import { image } from '../../lib/og';
import { visible } from '../../lib/content';
import { toolTitles } from '../../components/Tools';
export async function getStaticPaths() {
  const titles:Record<string,string>={home:'Student Loan Planning & College Financial Aid Tools',payoff:'Student Loan Payoff Calculator',calculator:'Federal Student Loan Repayment Calculator',tools:'Free Student Loan Calculators & Planning Tools',guides:'Student Loan Repayment & Financial Aid Guides','404':'Page unavailable'};
  for(const [key,tool] of Object.entries(toolTitles)) titles[key]=tool.title;
  for(const entry of await visible()) titles[entry.data.category+'-'+entry.id]=entry.data.title;
  return Object.entries(titles).map(([id,title])=>({params:{id},props:{title}}));
}
export const GET:APIRoute=async ({props})=>new Response(await image(String(props.title)),{headers:{'Content-Type':'image/png'}});
