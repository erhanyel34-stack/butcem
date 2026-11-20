import fs from 'node:fs';
const KEY=process.env.RAPIDAPI_KEY,HOST=process.env.FLIGHT_HOST,PATH=process.env.FLIGHT_PATH||'/search',DEBUG=process.env.DEBUG==='1';
if(!KEY||!HOST){console.log('RAPIDAPI_KEY ya da FLIGHT_HOST yok, atlandı.');process.exit(0)}
const IATA={'İstanbul':'IST','Ankara':'ESB','İzmir':'ADB','Antalya':'AYT','Dalaman':'DLM','Bodrum':'BJV','Trabzon':'TZX','Adana':'ADA','Gaziantep':'GZT','Kayseri':'ASR','Diyarbakır':'DIY','Samsun':'SZF'};
const ROTALAR=[['İstanbul','İzmir'],['İstanbul','Antalya'],['İstanbul','Dalaman'],['İstanbul','Bodrum'],['İstanbul','Trabzon'],['İstanbul','Adana'],['İstanbul','Gaziantep'],['İstanbul','Kayseri'],['İstanbul','Diyarbakır'],['İstanbul','Samsun'],['Ankara','İzmir'],['Ankara','Antalya'],['Ankara','Dalaman'],['Ankara','Bodrum'],['Ankara','Trabzon'],['İzmir','Antalya']];
const TARIH=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
function fiyatBul(obj){const a=[];(function gez(o,y){if(o&&typeof o==='object'){for(const k of Object.keys(o))gez(o[k],y+'.'+k.toLowerCase())}else if(typeof o==='number'&&/price|fare|amount|total/.test(y)&&o>100&&o<100000)a.push(o);else if(typeof o==='string'&&/price|fare|amount|total/.test(y)){const n=Number(o.replace(/[^\d.]/g,''));if(n>100&&n<100000)a.push(n)}})(obj,'');return a.length?Math.min(...a):null}
const sonuc={};
for(const [a,b] of ROTALAR){
  const url=`https://${HOST}${PATH}?`+new URLSearchParams({departure_id:IATA[a],arrival_id:IATA[b],outbound_date:TARIH,currency:'TRY',adults:'1'});
  try{const r=await fetch(url,{headers:{'x-rapidapi-key':KEY,'x-rapidapi-host':HOST}});const j=await r.json().catch(()=>null);
    if(DEBUG)console.log(a,b,r.status,JSON.stringify(j).slice(0,600));
    const f=r.ok&&j?fiyatBul(j):null;if(f)sonuc[`${a}|${b}`]=Math.round(f/10)*10;else console.log('fiyat yok:',a,b,r.status)}
  catch(e){console.log('hata:',a,b,e.message)}
  await new Promise(s=>setTimeout(s,1200));
}
const j=JSON.parse(fs.readFileSync('fiyatlar.json','utf8'));
if(Object.keys(sonuc).length>=3){j.ucakRota={...(j.ucakRota||{}),...sonuc};j.ucakGuncelleme=new Date().toISOString().slice(0,10);fs.writeFileSync('fiyatlar.json',JSON.stringify(j,null,1));console.log('Güncellendi:',Object.keys(sonuc).length,'rota')}
else console.log('Yeterli fiyat gelmedi, dosya değişmedi.');
