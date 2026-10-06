export const ZONE='America/Sao_Paulo';
export function dayKey(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
export function parts(d=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`,weekday:new Date(`${p.year}-${p.month}-${p.day}T12:00:00-03:00`).getUTCDay()}}
export function noteValid(n,now=new Date()){const t=now.getTime();if(n.deletedAt||(n.starts&&t<Date.parse(n.starts))||(n.ends&&t>=Date.parse(n.ends)))return false;if(n.repeat==='weekly'&&!n.days.includes(parts(now).weekday))return false;return true}
export function noteVisible(n,now=new Date()){return noteValid(n,now)&&(!n.hiddenUntil||now.getTime()>=Date.parse(n.hiddenUntil))}
export function nextMidnight(now=new Date()){const d=new Date(`${dayKey(now)}T00:00:00-03:00`);d.setUTCDate(d.getUTCDate()+1);return d.toISOString()}
export function parseTimes(s){const values=[...new Set(s.split(',').map(x=>x.trim()).filter(Boolean))];if(values.some(x=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(x)))throw Error('Use horários como 12:00, 15:00.');return values.sort()}
export function parseBefore(s){const a=[...new Set(s.split(',').map(x=>x.trim()).filter(Boolean).map(Number))];if(a.some(x=>!Number.isInteger(x)||x<0||x>525600))throw Error('Informe minutos inteiros, como 30, 120.');return a.sort((a,b)=>a-b)}
