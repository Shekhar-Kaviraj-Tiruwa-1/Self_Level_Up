// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react'
import { TimerReset, Pencil } from 'lucide-react'
const KEY='shek-countdown-v1'
function addMonthsDays(date, months, days){
  const d=new Date(date)
  d.setMonth(d.getMonth()+months)
  d.setDate(d.getDate()+days)
  return d
}
function load(){
  try{ const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw) }catch{}
  const now=new Date()
  const target=addMonthsDays(now,6,1) // default: 6 months + 1 day
  const state={ title:'First Castle: Rank‑A in 6m+1d', targetISO: target.toISOString() }
  try{ localStorage.setItem(KEY, JSON.stringify(state)) }catch{}
  return state
}
function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)) }catch{} }
function fmt(ms){
  if(ms<=0) return {d:0,h:0,m:0,s:0}
  const sec=Math.floor(ms/1000)
  const d=Math.floor(sec/86400)
  const h=Math.floor((sec%86400)/3600)
  const m=Math.floor((sec%3600)/60)
  const s=sec%60
  return {d,h,m,s}
}
export default function CountdownBar(){
  const [conf,setConf]=useState(load())
  const [now,setNow]=useState(Date.now())
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t) },[])
  const target=useMemo(()=> new Date(conf.targetISO).getTime(), [conf.targetISO])
  const left=useMemo(()=> Math.max(0, target-now), [target, now])
  const {d,h,m,s}=fmt(left)
  function edit(){
    const title=prompt('Milestone title', conf.title) || conf.title
    const when=prompt('Target ISO (YYYY-MM-DDTHH:mm)', conf.targetISO.slice(0,16)) || conf.targetISO
    const iso = when.length===16 ? when+':00.000Z' : when
    const next={ title, targetISO: iso }
    setConf(next); save(next)
  }
  function resetDefault(){
    const next={ title:'First Castle: Rank‑A in 6m+1d', targetISO: addMonthsDays(new Date(),6,1).toISOString() }
    setConf(next); save(next)
  }
  return (
    <div className="banner">
      <div className="banner-inner">
        <div className="flex items-center gap-2"><TimerReset className="w-4 h-4"/><span className="text-sm">{conf.title}</span></div>
        <div className="flex items-center gap-3">
          <div className="time">{String(d).padStart(2,'0')}d:{String(h).padStart(2,'0')}h:{String(m).padStart(2,'0')}m:{String(s).padStart(2,'0')}s</div>
          <button className="btn" onClick={edit}><Pencil className="w-4 h-4"/></button>
          <button className="btn" onClick={resetDefault}>Reset</button>
        </div>
      </div>
    </div>
  )
}
