// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Goal, ListChecks, Check, AlertCircle, BookmarkCheck, Pencil } from 'lucide-react'
const KEY='shek-tracks-v1'
const DEFAULT={ track:'MLE', check:{}, artifacts:[], tracks:{
  'MLE': { title:'ML Engineer / AI Engineer', bullets:['Python + OOP + tests','PyTorch/TensorFlow basics + training loop','Docker (slim), GitHub Actions CI','Deploy API (FastAPI) to AWS or Azure','Data pipelines + SQL','Monitoring: logs/metrics; basic MLflow'], interview:['System design (ML service)','Data structures & algos (LeetCode)','MLOps tradeoffs (cost/latency/retrain)','Metrics & monitoring plan'] },
  'DS':  { title:'Data Scientist / Applied ML', bullets:['Statistics & ML (sklearn)','Feature engineering & evaluation','SQL + dashboards','Experiment design & A/B','Communicating insights'], interview:['Case study with messy data','Metrics definition & bias checks','Model selection & error analysis'] },
  'RES': { title:'AI Safety / Research Engineer', bullets:['Python (LeetCode routines)','Paper reading & replication','Transformers & HF tooling','Evaluation design & threat models','Write clear reports'], interview:['Design an evaluation','Identify methodological flaws','Reproduce a small paper result'] }
} }
function load(){ try{const r=localStorage.getItem(KEY); return r? JSON.parse(r):DEFAULT }catch{return DEFAULT} }
function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)) }catch{} }
export default function Tracks(){
  const [s,setS]=useState(load()); useEffect(()=>save(s),[s])
  const t=s.tracks[s.track]
  function toggle(k){ setS(p=>({ ...p, check:{...p.check, [k]: !p.check[k]} })) }
  function addArtifact(){ const url=prompt('Add an artifact URL (repo, post, demo)?'); if(!url) return; setS(p=>({ ...p, artifacts:[...p.artifacts, url] })) }
  function editLists(){
    const current = JSON.stringify({ bullets:t.bullets, interview:t.interview }, null, 2)
    const next = prompt('Edit bullets/interview as JSON', current)
    if(!next) return
    try{
      const parsed = JSON.parse(next)
      if(!Array.isArray(parsed.bullets) || !Array.isArray(parsed.interview)) throw new Error('Arrays required')
      setS(p=>({ ...p, tracks:{...p.tracks, [p.track]:{...p.tracks[p.track], bullets:parsed.bullets, interview:parsed.interview}} }))
    }catch(e){ alert('Invalid JSON: '+e.message) }
  }
  return (
    <section className="max-w-6xl mx-auto px-4 py-10" id="tracks">
      <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400"><Goal className="w-4 h-4"/> Six‑Month Job Tracks</div>
      <h2 className="text-2xl font-extrabold mt-2">Becoming Rank A: Job‑Ready</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">Pick a primary track now. Switch any time — saved locally. Add artifacts as you build.</p>
      <div className="mt-4 flex gap-2">{Object.keys(s.tracks).map(k=>(<button key={k} className={"btn "+(s.track===k? "ring-2 ring-black dark:ring-white":"")} onClick={()=>setS(p=>({...p, track:k}))}>{s.tracks[k].title}</button>))}</div>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <div className="cardh"><ListChecks className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Skills & Milestones</div><div className="text-xs text-gray-500">{t.title}</div></div><button className="btn ml-auto" onClick={editLists}><Pencil className="w-4 h-4 mr-1 inline"/>Edit lists</button></div>
          <div className="cardb">
            <ul className="space-y-2 text-sm">
              {t.bullets.map((b,i)=>{ const key=`b-${s.track}-${i}`; const on=s.check[key]; return (<li key={key} className="flex items-center gap-2"><button className={"kbd "+(on? "bg-black text-white dark:bg-white dark:text-black":"")} onClick={()=>toggle(key)}>{on? '✔' : ''}</button><span>{b}</span></li>) })}
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="cardh"><AlertCircle className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Interview Readiness</div><div className="text-xs text-gray-500">Practice weekly</div></div><button className="btn ml-auto" onClick={editLists}><Pencil className="w-4 h-4 mr-1 inline"/>Edit lists</button></div>
          <div className="cardb">
            <ul className="space-y-2 text-sm">
              {t.interview.map((b,i)=>{ const key=`i-${s.track}-${i}`; const on=s.check[key]; return (<li key={key} className="flex items-center gap-2"><button className={"kbd "+(on? "bg-black text-white dark:bg-white dark:text-black":"")} onClick={()=>toggle(key)}>{on? '✔' : ''}</button><span>{b}</span></li>) })}
            </ul>
          </div>
        </div>
      </div>
      <div className="card mt-6">
        <div className="cardh"><BookmarkCheck className="w-5 h-5"/><div><div className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-300">Artifacts (Proof of Work)</div><div className="text-xs text-gray-500">Repos • demos • writeups</div></div></div>
        <div className="cardb">
          <div className="flex gap-2 mb-3"><button className="btn" onClick={addArtifact}>Add artifact</button></div>
          <ol className="list-decimal pl-5 space-y-1 text-sm">{s.artifacts.map((a,i)=>(<li key={i}><a href={a} target="_blank" className="underline">{a}</a></li>))}{s.artifacts.length===0 && (<div className="text-xs text-gray-500">No artifacts yet — add your first repo or post.</div>)}</ol>
        </div>
      </div>
    </section>
  )
}
