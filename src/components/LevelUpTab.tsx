// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react'
import { Sword, Trophy, RefreshCcw, Share2, PlusCircle, Pencil, Trash2, CalendarCheck2, Dumbbell, BookOpenText, Type, Wind, Shield, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
const STORAGE_KEY = 'shek-levelup-state-v2'
const DEFAULT_DAILY_QUESTS=[
  { id:'q-workout', title:'Workout 10–20 minutes (or gym)', description:'Body before code. Movement unlocks focus.', xp:20, type:'daily', icon:'dumbbell' },
  { id:'q-reading', title:'Read 10 minutes (AI/Safety/Docs)', description:'Feed the mind. Summarize one insight.', xp:10, type:'daily', icon:'book' },
  { id:'q-writing', title:'Write 100 words (reflection/code notes)', description:'Clarity through writing. Publish if possible.', xp:15, type:'daily', icon:'type' },
  { id:'q-talk', title:'Speak 5 min (teach aloud / rubber duck)', description:'Turn knowledge into language under pressure.', xp:10, type:'daily', icon:'wind' },
  { id:'q-lc20', title:'LeetCode 20m (python)', description:'Algorithmic reps for research/engineering interviews.', xp:15, type:'daily' },
]
const DEFAULT_WEEKLY_QUESTS=[
  { id:'w-exp', title:'2× 2hr experiment sessions', description:'Run model/pipeline/safety eval sprints.', xp:60, type:'weekly' },
  { id:'w-thread', title:'Publish one public thread', description:'Compress lessons into shareable signal.', xp:50, type:'weekly' },
  { id:'w-sprint', title:'Weekend 4–6 hr build sprint', description:'Ship a demo or close an issue.', xp:80, type:'weekly' },
  { id:'w-mock', title:'1× mock interview', description:'System design / whiteboard / research Q&A.', xp:60, type:'weekly' },
]
const DEFAULT_BOSSES=[
  { id:'b-aws-api', title:'Ship an AWS Lambda+API Gateway service', description:'Deploy a minimal API with IaC notes.', xp:180, progress:0, type:'boss' },
  { id:'b-dockerize', title:'Dockerize & CI publish', description:'Slim Dockerfile, compose for dev, GH Actions build & push.', xp:150, progress:0, type:'boss' },
  { id:'b-azure-app', title:'Azure App Service deploy', description:'Container deploy + basic metrics & cost notes.', xp:150, progress:0, type:'boss' },
  { id:'b-rag-safety', title:'RAG Safety Inspector v1', description:'Evals for provenance & hallucination risk + dashboard.', xp:220, progress:0, type:'boss' },
  { id:'b-leetcode-60', title:'LeetCode 60 problems (Python)', description:'Arrays/Strings/Hash/Two Pointers/Stack/Tree.', xp:240, progress:0, type:'boss' },
  { id:'b-papers-8', title:'8 paper reflections', description:'800–1200 words each; publish summaries.', xp:220, progress:0, type:'boss' },
]
const DEFAULT_QUOTES=['I don’t chase power. I build the version of me no weakness can touch.']
const PUNISHMENT_POOL=[
  { id:'p-aws-module', label:'Do 1 AWS module (45–60m)', emoji:'🟧' },
  { id:'p-azure-module', label:'Do 1 Azure module (45–60m)', emoji:'🔷' },
  { id:'p-docker-lab', label:'Complete a Docker tutorial lab (45m)', emoji:'🐳' },
  { id:'p-linux-cmds', label:'Practice 30 Linux CLI commands', emoji:'🐧' },
  { id:'p-walk-20', label:'20-minute brisk walk', emoji:'🚶' },
  { id:'p-core-10', label:'Core workout 10 min', emoji:'🏃' },
  { id:'p-write-200', label:'Write 200 words on what you relearned', emoji:'✍️' },
  { id:'p-explain-5min', label:'5-minute voice note teaching the concept', emoji:'🎙️' },
]
const RANKS=[{name:'E',threshold:0},{name:'D',threshold:500},{name:'C',threshold:1200},{name:'B',threshold:2200},{name:'A',threshold:3600},{name:'S',threshold:5200},{name:'SS',threshold:7000},{name:'SSS',threshold:9000},{name:'∞',threshold:12000}]

function formatDateKey(d=new Date()){ return d.toISOString().slice(0,10) }
function getWeekKey(d=new Date()){ const date=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const day=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-day); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); const weekNo=Math.ceil(((date.getTime()-yearStart.getTime())/86400000+1)/7); return `${date.getUTCFullYear()}-W${weekNo}` }
function load(){ try{ const raw=localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw):null }catch{return null} }
function save(s){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }catch{} }
function init(){ return { quotes:DEFAULT_QUOTES, dailyCompletion:{}, weeklyCompletion:{}, bossProgress:Object.fromEntries(DEFAULT_BOSSES.map(b=>[b.id,0])), dailyQuests:DEFAULT_DAILY_QUESTS, weeklyQuests:DEFAULT_WEEKLY_QUESTS, bosses:DEFAULT_BOSSES, weight:{target:undefined,entries:[]}, xpBonus:0, punishment:{accepted:null} } }
function dailyXP(s){ let t=0; const today=formatDateKey(); s.dailyQuests.forEach(q=>{ const k=`${q.id}@${today}`; if(s.dailyCompletion[k]) t+=q.xp }); return t }
function weeklyXP(s){ let t=0; const wk=getWeekKey(); s.weeklyQuests.forEach(q=>{ const k=`${q.id}@${wk}`; if((s.weeklyCompletion[k]||0)>0) t+=q.xp }); return t }
function bossXP(s){ let t=0; s.bosses.forEach(b=>{ const p=s.bossProgress[b.id]??0; t+=Math.round((p/100)*b.xp) }); return t }
function totalXP(s){ return dailyXP(s)+weeklyXP(s)+bossXP(s)+(s.xpBonus||0) }
function rankFrom(xp){ let c=RANKS[0], n=null; for(const r of RANKS){ if(xp>=r.threshold) c=r; else { n=r; break } } return {current:c,next:n} }
function pctNext(xp){ const {current,next}=rankFrom(xp); if(!next) return 100; const span=next.threshold-current.threshold; const into=xp-current.threshold; return Math.min(Math.max(Math.round((into/span)*100),0),100) }

export default function LevelUpTab(){
  const [s,setS]=useState(()=>load()||init())
  const [today]=useState(formatDateKey()); const [weekKey]=useState(getWeekKey())
  const total=useMemo(()=>totalXP(s),[s]); const p=useMemo(()=>pctNext(total),[total]); const {current:r,next:n}=useMemo(()=>rankFrom(total),[total])
  const [quote,setQuote]=useState(s.quotes?.[0]||DEFAULT_QUOTES[0]); useEffect(()=>save(s),[s])

  const weightData=(s.weight.entries||[]).slice(-30).map(e=>({date:e.date.slice(5),weight:e.weight}))
  const latest=s.weight.entries[s.weight.entries.length-1]?.weight; const target=s.weight.target

  function tglDaily(id){ const k=`${id}@${today}`; setS(st=>({...st, dailyCompletion:{...st.dailyCompletion,[k]:!st.dailyCompletion[k]}})) }
  function markWeekly(id){ const k=`${id}@${weekKey}`; setS(st=>({...st, weeklyCompletion:{...st.weeklyCompletion,[k]:1}})) }
  function updBoss(id,v){ const val=Math.min(Math.max(Math.round(v),0),100); setS(st=>({...st, bossProgress:{...st.bossProgress,[id]:val}})) }

  function addDaily(){ const title=prompt('Quest title?'); if(!title) return; const xp=parseInt(prompt('XP value? e.g., 10')||'10',10); const id=`q-${crypto.randomUUID?.()||Math.random().toString(36).slice(2,8)}`; setS(st=>({...st, dailyQuests:[...st.dailyQuests,{id,title,description:'Custom daily quest',xp,type:'daily'}]})) }
  function editDaily(id){ const q=s.dailyQuests.find(x=>x.id===id); if(!q) return; const next=prompt('Edit (title | xp)', `${q.title} | ${q.xp}`); if(!next) return; const [t, x] = next.split('|').map(a=>a.trim()); const xp=parseInt(x||q.xp,10); setS(st=>({...st, dailyQuests: st.dailyQuests.map(it=>it.id===id? {...it, title:t||q.title, xp: isNaN(xp)? q.xp: xp }: it)})) }
  function delDaily(id){ setS(st=>({...st, dailyQuests: st.dailyQuests.filter(it=>it.id!==id)})) }

  function addWeekly(){ const title=prompt('Dungeon title?'); if(!title) return; const xp=parseInt(prompt('XP value? e.g., 50')||'50',10); const id=`w-${crypto.randomUUID?.()||Math.random().toString(36).slice(2,8)}`; setS(st=>({...st, weeklyQuests:[...st.weeklyQuests,{id,title,description:'Custom weekly dungeon',xp,type:'weekly'}]})) }
  function editWeekly(id){ const q=s.weeklyQuests.find(x=>x.id===id); if(!q) return; const next=prompt('Edit (title | xp)', `${q.title} | ${q.xp}`); if(!next) return; const [t, x] = next.split('|').map(a=>a.trim()); const xp=parseInt(x||q.xp,10); setS(st=>({...st, weeklyQuests: st.weeklyQuests.map(it=>it.id===id? {...it, title:t||q.title, xp: isNaN(xp)? q.xp: xp }: it)})) }
  function delWeekly(id){ setS(st=>({...st, weeklyQuests: st.weeklyQuests.filter(it=>it.id!==id)})) }

  function addBoss(){ const title=prompt('Boss title?'); if(!title) return; const xp=parseInt(prompt('XP on full clear? e.g., 200')||'200',10); const id=`b-${crypto.randomUUID?.()||Math.random().toString(36).slice(2,8)}`; setS(st=>({...st, bosses:[...st.bosses,{id,title,description:'Custom boss',xp,progress:0,type:'boss'}], bossProgress:{...st.bossProgress, [id]:0}})) }
  function editBoss(id){ const q=s.bosses.find(x=>x.id===id); if(!q) return; const next=prompt('Edit (title | xp)', `${q.title} | ${q.xp}`); if(!next) return; const [t, x] = next.split('|').map(a=>a.trim()); const xp=parseInt(x||q.xp,10); setS(st=>({...st, bosses: st.bosses.map(it=>it.id===id? {...it, title:t||q.title, xp: isNaN(xp)? q.xp: xp }: it)})) }
  function delBoss(id){ setS(st=>({...st, bosses: st.bosses.filter(it=>it.id!==id)})) }

  function assignPun(){ const pick=PUNISHMENT_POOL[Math.floor(Math.random()*PUNISHMENT_POOL.length)]; setS(st=>({...st, punishment:{accepted:pick}})) }
  function donePun(){ setS(st=>({...st, xpBonus:(st.xpBonus||0)+30, punishment:{accepted:null}})) }

  return (
    <div className="max-w-6xl mx-auto px-4" id="level-up">
      {/* Rank/XP & Mantra */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <div className="cardh"><Trophy className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Rank & XP</div><div className="text-xs text-gray-500">E → D → C → B → A → S → SS → SSS → ∞</div></div></div>
          <RankBlock total={total} p={p} r={r} />
        </div>
        <div className="card">
          <div className="cardh"><Zap className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Mantra</div><div className="text-xs text-gray-500">Edit your banner quote</div></div></div>
          <div className="cardb">
            <textarea className="w-full h-24 input" value={quote} onChange={(e)=>setQuote(e.target.value)} />
            <div className="text-xs text-gray-500 mt-2">Saved with the page (you can also export/import from Settings).</div>
          </div>
        </div>
      </div>

      {/* Dailies & Weekly */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 card">
          <div className="cardh"><CalendarCheck2 className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Daily Quests</div><div className="text-xs text-gray-500">Editable list</div></div><div className="ml-auto flex gap-2"><button className="btn" onClick={addDaily}><PlusCircle className="w-4 h-4 inline mr-1"/>Add</button><button className="btn" onClick={assignPun}><RefreshCcw className="w-4 h-4 inline mr-1"/>Missed? Mini‑boss</button></div></div>
          <div className="cardb">
            <ul className="divide-y dark:divide-zinc-800">
              {s.dailyQuests.map(q=>{ const k=`${q.id}@${formatDateKey()}`; const done=!!s.dailyCompletion[k]; return (
                <li key={q.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {q.icon==='dumbbell' && <Dumbbell className="w-4 h-4"/>}{q.icon==='book' && <BookOpenText className="w-4 h-4"/>}{q.icon==='type' && <Type className="w-4 h-4"/>}{q.icon==='wind' && <Wind className="w-4 h-4"/>}
                    <div><div className="font-medium text-sm">{q.title}</div><div className="text-xs text-gray-500">{q.description}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge">{q.xp} XP</span>
                    <input type="checkbox" checked={done} onChange={()=>tglDaily(q.id)} className="w-5 h-5"/>
                    <button className="btn" onClick={()=>editDaily(q.id)}><Pencil className="w-4 h-4"/></button>
                    <button className="btn" onClick={()=>delDaily(q.id)}><Trash2 className="w-4 h-4"/></button>
                  </div>
                </li>
              )})}
            </ul>
            {s.punishment?.accepted && <div className="mt-3 flex items-center gap-2"><span className="badge">{s.punishment.accepted.emoji} {s.punishment.accepted.label}</span><button className="btnp" onClick={donePun}>Mark Done (+30 XP)</button></div>}
          </div>
        </div>
        <div className="card">
          <div className="cardh"><Shield className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Weekly Dungeons</div><div className="text-xs text-gray-500">Editable list</div></div><button className="btn ml-auto" onClick={addWeekly}><PlusCircle className="w-4 h-4 inline mr-1"/>Add</button></div>
          <div className="cardb">
            <ul className="divide-y dark:divide-zinc-800">
              {s.weeklyQuests.map(q=>{ const k=`${q.id}@${getWeekKey()}`; const done=(s.weeklyCompletion[k]||0)>0; return (
                <li key={q.id} className="py-3 flex items-center justify-between">
                  <div><div className="font-medium text-sm">{q.title}</div><div className="text-xs text-gray-500">{q.description}</div></div>
                  <div className="flex items-center gap-2">
                    <span className="badge">{q.xp} XP</span>
                    <button className={"btn "+(done?'opacity-60 cursor-not-allowed':'')} onClick={()=>markWeekly(q.id)}>{done?'Done':'Mark'}</button>
                    <button className="btn" onClick={()=>editWeekly(q.id)}><Pencil className="w-4 h-4"/></button>
                    <button className="btn" onClick={()=>delWeekly(q.id)}><Trash2 className="w-4 h-4"/></button>
                  </div>
                </li>
              )})}
            </ul>
          </div>
        </div>
      </div>

      {/* Bosses + Cutting */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 card">
          <div className="cardh"><Sword className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Boss Battles</div><div className="text-xs text-gray-500">Editable + proportional XP</div></div><button className="btn ml-auto" onClick={addBoss}><PlusCircle className="w-4 h-4 inline mr-1"/>Add</button></div>
          <div className="cardb">
            <ul className="space-y-4">
              {s.bosses.map(b=>{ const prog=s.bossProgress[b.id]??0; return (
                <li key={b.id} className="p-4 border dark:border-zinc-800 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div><div className="font-semibold text-sm">{b.title}</div><div className="text-xs text-gray-500 max-w-2xl">{b.description}</div><div className="text-[11px] text-gray-500 mt-2">XP on full clear: {b.xp}</div></div>
                    <div className="flex items-center gap-2">
                      <span className="badge">Progress: {prog}%</span>
                      <button className="btn" onClick={()=>editBoss(b.id)}><Pencil className="w-4 h-4"/></button>
                      <button className="btn" onClick={()=>delBoss(b.id)}><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-black dark:bg-white" style={{width:`${prog}%`}}/></div>
                    <input type="range" min={0} max={100} value={prog} onChange={(e)=>updBoss(b.id, Number(e.target.value))} className="w-full mt-2"/>
                  </div>
                </li>
              )})}
            </ul>
          </div>
        </div>

        <WeightCard s={s} setS={setS} latest={latest} target={target} data={weightData} />
      </div>
    </div>
  )
}

function RankBlock({total,p,r}){
  return (
    <div className="cardb grid sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border"><div className="text-xs uppercase text-gray-500">Current Rank</div><div className="text-3xl font-bold mt-1">{r.name}</div><div className="text-xs text-gray-500 mt-2">Total XP: {total}</div></div>
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border"><div className="text-xs uppercase text-gray-500">Next Rank</div><div className="text-xl font-semibold mt-1">{nextName(r.name)}</div><div className="mt-2"><div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-black dark:bg-white" style={{width:`${p}%`}}/></div><div className="text-xs text-gray-500 mt-1">{p}% to next</div></div></div>
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border"><div className="text-xs uppercase text-gray-500">Today</div><div className="text-xs text-gray-500 mt-2">Log work, mark quests, move sliders.</div></div>
    </div>
  )
}
function nextName(n){ const order=['E','D','C','B','A','S','SS','SSS','∞']; const i=order.indexOf(n); return i<0||i===order.length-1? '∞' : order[i+1] }

function WeightCard({s,setS,latest,target,data}){
  return (
    <div className="card">
      <div className="cardh"><Dumbbell className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Cutting Tracker</div><div className="text-xs text-gray-500">Log weight; watch the trend</div></div></div>
      <div className="cardb"><WeightWidget s={s} setS={setS} latest={latest} target={target} data={data}/></div>
    </div>
  )
}
function WeightWidget({s,setS,latest,target,data}){
  const [v,setV]=useState('')
  function log(){ const n=parseFloat(v); if(isNaN(n)) return; const d=formatDateKey(); setS(st=>({...st, weight:{...st.weight, entries:[...st.weight.entries,{date:d,weight:n}]}})); setV('') }
  function setT(){ const n=parseFloat(prompt('Target weight (kg)?')||''); if(isNaN(n)) return; setS(st=>({...st, weight:{...st.weight, target:n}})) }
  return (<>
    <div className="flex items-center gap-2">
      <input type="number" step="0.1" placeholder="Weight (kg)" className="w-32 input" value={v} onChange={e=>setV(e.target.value)} />
      <button className="btnp" onClick={log}>Log</button>
      <button className="btn" onClick={setT}>Set Target</button>
    </div>
    <div className="text-xs text-gray-500 mt-2">Latest: {latest != null ? `${latest} kg` : '—'} {target != null ? ` • Target: ${target} kg` : ''}</div>
    <div className="h-44 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top:5, right:10, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={10} />
          <YAxis domain={['auto','auto']} fontSize={10} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="weight" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </>)
}
