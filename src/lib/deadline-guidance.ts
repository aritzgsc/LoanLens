export type DeadlineState='passed'|'today'|'upcoming';
export type DeadlineResult={iso:string;state:DeadlineState;days:number;label:string};
const pattern=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export function validCalendarDate(value:string) {
  if(!pattern.test(value))return false;
  const date=new Date(value+'T00:00:00Z');
  return Number.isFinite(date.valueOf())&&date.toISOString().slice(0,10)===value;
}
export function localToday(now=new Date()) {
  return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
}
export function deadlineFromNotice(notice:string,days:number,today=localToday()):DeadlineResult|null {
  if(!validCalendarDate(notice)||!validCalendarDate(today)||!Number.isInteger(days)||days<0)return null;
  const date=new Date(notice+'T00:00:00Z');
  date.setUTCDate(date.getUTCDate()+days);
  const iso=date.toISOString().slice(0,10);
  const difference=Math.round((Date.parse(iso+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
  const state=difference<0?'passed':difference===0?'today':'upcoming';
  const label=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
  return {iso,state,days:Math.abs(difference),label};
}
