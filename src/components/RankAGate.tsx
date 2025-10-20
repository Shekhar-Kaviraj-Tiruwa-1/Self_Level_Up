// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Trophy, ShieldCheck, PlusCircle, Pencil, Trash2 } from 'lucide-react'
const KEY='shek-ranka-v1'
const DEFAULT=[
  { id:'g-skill', label:'Job‑ready skill matrix covered', detail:'Python • DL framework • Docker • Cloud deploy • SQL', done:false },
  { id:'g-project', label:'1 polished project shipped with deploy', detail:'Demo + README + CI + cost notes', done:false },
  { id:'g-interviews', label:'3 real interviews (or 5 mocks) completed', detail:'Track learnings + iterate', done:false },
  { id:'g-research', label:'Research stripe: 8 paper reflections', detail:'Publish concise insights', done:false }
]
function migrate(x){
  // migrate old object-shape {goals:{...}} to array
  if(x && x.goals && !Array.isArray(x.goals)){
    const g=x.goals
    const arr=[
      { id:'g-skill', label:'Job‑ready skill matrix covered', detail:'Python • DL framework • Docker • Cloud deploy • SQL', done:!!g.jobReady },
      { id:'g-project', label:'1 polished project shipped with deploy', detail:'Demo + README + CI + cost notes', done:!!g.projectShipped },
      { id:'g-interviews', label:'3 real interviews (or 5 mocks) completed', detail:'Track learnings + iterate', done:!!g.interviews },
      { id:'g-research', label:'Research stripe: 8 paper reflections', detail:'Publish concise insights', done:!!g.researchStripe }
    ]
    return arr
  }
  return Array.isArray(x)? x : DEFAULT
}
function load(){ try{const r=localStorage.getItem(KEY); return migrate(r? JSON.parse(r):DEFAULT)}catch{return DEFAULT} }
function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)) }catch{} }

export default function RankAGate(){
  const [goals,setGoals]=useState(load()); useEffect(()=>save(goals),[goals])
  const all = goals.every(g=>g.done)
  function toggle(id){ setGoals(gs=>gs.map(g=>g.id===id? {...g, done:!g.done } : g)) }
  function add(){ const label=prompt('New goal label?'); if(!label) return; const detail=prompt('Detail?')||''; setGoals(gs=>[...gs,{id:'g-'+Math.random().toString(36).slice(2,8), label, detail, done:false}]) }
  function edit(id){ const g=goals.find(x=>x.id===id); if(!g) return; const next=prompt('Edit (label | detail)', `${g.label} | ${g.detail}`); if(!next) return; const [l,d]=next.split('|').map(s=>s.trim()); setGoals(gs=>gs.map(x=>x.id===id? {...x, label:l||g.label, detail:d||g.detail}:x)) }
  function del(id){ setGoals(gs=>gs.filter(g=>g.id!==id)) }
  return (
    <section className="max-w-6xl mx-auto px-4 py-10" id="rank-a">
      <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400"><Trophy className="w-4 h-4"/> Rank‑A Gate (6‑Month Target)</div>
      <h2 className="text-2xl font-extrabold mt-2">What counts as Rank A?</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">Customize your Rank‑A criteria below. When all boxes are checked, the badge unlocks.</p>
      <div className="mt-4"><button className="btn" onClick={add}><PlusCircle className="w-4 h-4 inline mr-1"/>Add goal</button></div>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {goals.map(g=>(
          <div key={g.id} className="card p-4 flex items-start justify-between gap-4">
            <div><div className="font-medium text-sm">{g.label}</div><div className="text-xs text-gray-500">{g.detail}</div></div>
            <div className="flex items-center gap-2">
              <button className={"kbd "+(g.done? "bg-black text-white dark:bg-white dark:text-black":"")} onClick={()=>toggle(g.id)}>{g.done? '✔':''}</button>
              <button className="btn" onClick={()=>edit(g.id)}><Pencil className="w-4 h-4"/></button>
              <button className="btn" onClick={()=>del(g.id)}><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
      <div className={"mt-6 card p-6 text-center "+(all?'ring-2 ring-yellow-500':'')}>
        {all ? (<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500 text-black font-semibold"><ShieldCheck className="w-4 h-4"/> Rank A Unlocked — wear it proudly</div>) : (<div className="text-sm text-gray-500">Complete all goals to unlock Rank A.</div>)}
      </div>
    </section>
  )
}
