// @ts-nocheck
import React, { useEffect, useState } from 'react'
import LevelUpTab from './components/LevelUpTab'
import Tracks from './components/Tracks'
import RankAGate from './components/RankAGate'
import CountdownBar from './components/CountdownBar'
import { Swords, Sun, Moon } from 'lucide-react'

function useDarkMode(){
  const [dark,setDark]=useState(()=>{
    const s=localStorage.getItem('shek-dark'); if(s) return s==='1'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(()=>{
    const root=document.documentElement
    if(dark){ root.classList.add('dark'); localStorage.setItem('shek-dark','1') }
    else { root.classList.remove('dark'); localStorage.setItem('shek-dark','0') }
  },[dark])
  return [dark,setDark] as const
}

function useHashRoute(){
  const [hash,setHash]=useState(window.location.hash || '#/')
  useEffect(()=>{
    const onHash=()=>setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash); return ()=>window.removeEventListener('hashchange', onHash)
  },[])
  return [hash,(h:string)=>window.location.hash=h] as const
}

export default function App(){
  const [dark,setDark]=useDarkMode()
  const [hash,setHash]=useHashRoute()
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-zinc-950">
      {/* Top countdown banner */}
      <CountdownBar />

      <nav className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold"><Swords className="w-5 h-5"/><span>Shek — Level Up v3.1</span></div>
          <div className="flex items-center gap-3">
            <button className={"btn "+(hash==='#/rank-a'?'ring-2 ring-black dark:ring-white':'')} onClick={()=>setHash('#/rank-a')}>Rank‑A</button>
            <button className={"btn "+(hash==='#/tracks'?'ring-2 ring-black dark:ring-white':'')} onClick={()=>setHash('#/tracks')}>Tracks</button>
            <button className={"btn "+(hash==='#/'?'ring-2 ring-black dark:ring-white':'')} onClick={()=>setHash('#/')}>Dashboard</button>
            <button className="btn" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark? 'Light' : 'Dark'}</button>
          </div>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-4 pt-10 pb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight"><span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400">Solo Leveling: Infinite Mode</span></h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl">Editable. Portable. Yours. Every section can be customized; the top banner counts down to your “First Castle” milestone.</p>
      </header>

      {hash==='#/rank-a' && <RankAGate />}
      {hash==='#/tracks' && <Tracks />}
      {hash==='#/' && <section className="pb-16"><LevelUpTab /></section>}

      <footer className="border-t border-gray-200 dark:border-zinc-800 py-6 text-center text-sm text-gray-500">Built by Shek · One who builds — and builds safe.</footer>
    </div>
  )
}
