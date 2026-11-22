import { getCollection } from 'astro:content';
import { publishDrafts } from './site';
export async function visible() {
  return (await getCollection('pages', x=>publishDrafts || x.data.status==='reviewed')).sort((a,b)=>a.data.title.localeCompare(b.data.title));
}
export function entryPath(entry:{id:string;data:{category:string}}) {
  return (entry.data.category==='guide'?'/guides/':'/')+entry.id+'/';
}
