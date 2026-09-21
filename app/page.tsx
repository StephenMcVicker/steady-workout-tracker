"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Footprints, Dumbbell, Check, ChevronRight, ArrowLeft, Clock3, History, Smartphone, Leaf, CircleCheck, Minus, Plus, Trophy, Info, X, CalendarDays, Layers3, Target, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { categories, descriptions, workouts, emptyStore, newSession, countSets, isStore, duration, localDate, sessionDate, formatDate, sortedHistory, nextAim, type Category, type Exercise, type Store, type Session } from "@/lib/workouts";

import { assetPath } from "@/lib/paths";

const STORAGE_KEY="steady-workouts-v1";
const categoryIcons={Push:ArrowUpRight,Pull:ArrowDownLeft,Legs:Footprints,"Full Body":Layers3};
export default function Home(){
 const [store,setStore]=useState<Store>(emptyStore);
 const [ready,setReady]=useState(false);
 const [storageError,setStorageError]=useState("");
 const [view,setView]=useState<"home"|"workout"|"history"|"summary">("home");
 const [detail,setDetail]=useState<string|null>(null);
 const [summaryId,setSummaryId]=useState<string|null>(null);
 const [draftDate,setDraftDate]=useState("");
 const [notice,setNotice]=useState("");
 const headingRef=useRef<HTMLHeadingElement>(null);
 const lastRef=useRef<Store>(store); lastRef.current=store;
 const category=store.selected;
 const exercises=workouts[category];
 const session=store.active[category];
 const chosenDate=session?sessionDate(session):draftDate;
 const total=exercises.reduce((sum,e)=>sum+e.sets,0);
 const completed=countSets(session);
 const exercise=exercises.find(e=>e.id===detail);
 const history=sortedHistory(store.history);
 const summary=store.history.find(s=>s.id===summaryId);
 useEffect(()=>{
  try {const saved=localStorage.getItem(STORAGE_KEY); if(saved){const parsed:unknown=JSON.parse(saved); if(!isStore(parsed))throw new Error("invalid"); setStore(parsed);}}
  catch{setStorageError("Saved progress couldn’t be loaded. Changes will not overwrite it. Check your browser storage.");}
  setDraftDate(localDate());setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready||storageError)return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(store));}catch{setStorageError("Saving unavailable. Keep this page open to keep your current progress.");}
 },[store,ready,storageError]);
 useEffect(()=>{headingRef.current?.focus();window.scrollTo({top:0});},[view]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),4000);return()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{
  if(process.env.NODE_ENV==="production"&&"serviceWorker" in navigator) navigator.serviceWorker.register(assetPath("/sw.js"), {scope: assetPath("/")}).catch(()=>{});
  const ctx=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
  if(!ctx)return;const lifecycle=new AbortController();
  try{Promise.resolve(ctx.registerTool({name:"read_workout_progress",description:"Read the selected routine, exercises and locally recorded set progress.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:(input:unknown)=>{if(!input||typeof input!=="object"||Object.keys(input).length)throw new Error("Expected an empty object");const s=lastRef.current;return {category:s.selected,exercises:workouts[s.selected],session:s.active[s.selected]??null};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
  return()=>lifecycle.abort();
 },[]);
 function selectCategory(value:string){setStore(s=>({...s,selected:value as Category}));setDetail(null);}
 function changeDate(date:string){if(session)setStore(s=>({...s,active:{...s.active,[category]:{...s.active[category]!,date}}}));else setDraftDate(date);}
 function start(){if(!ready||!chosenDate)return;if(!session)setStore(s=>({...s,active:{...s.active,[category]:newSession(category,s.weights,chosenDate)}}));setView("workout");}
 function openExercise(e:Exercise){if(!session||session.exercises[e.id].every(s=>s.done))return;setDetail(e.id);window.scrollTo({top:0});}
 function updateSet(id:string,index:number,kg:number,reps:number,done:boolean){
  setStore(s=>{const current=s.active[category];if(!current||current.exercises[id].every(set=>set.done))return s;const sets=current.exercises[id].map((x,i)=>i===index?{kg,reps,done}:x);return {...s,weights:{...s.weights,[id]:kg},active:{...s.active,[category]:{...current,exercises:{...current.exercises,[id]:sets}}}};});
  if(done){
   const exerciseComplete=session?.exercises[id].every((set,i)=>i===index||set.done);
   if(exerciseComplete){setDetail(null);window.scrollTo({top:0});}
   setNotice(completed+1===total?"":exerciseComplete?"Exercise complete. Rest before the next one.":`Set ${index+1}/${session?.exercises[id].length} saved. Rest 60–90 seconds.`);
  }
 }
 function finish(){
  if(!session||completed!==total)return;
  const finished={...session,date:sessionDate(session),finishedAt:new Date().toISOString()};
  setStore(s=>{if(!s.active[category])return s;const active={...s.active};delete active[category];return {...s,active,history:[finished,...s.history]};});
  setNotice("");setSummaryId(finished.id);setDraftDate(localDate());setView("summary");
 }
 function openSummary(s:Session){setSummaryId(s.id);setView("summary");}
 const nav=(mobile=false)=><nav className={mobile?"bottom-nav":"top-nav"} aria-label={mobile?"Mobile navigation":"Main navigation"}><button className={view==="home"||view==="workout"?"selected":""} onClick={()=>{setView("home");setDetail(null);}}><Dumbbell size={19}/>Workouts</button><button className={view==="history"||view==="summary"?"selected":""} onClick={()=>{setView("history");setDetail(null);}}><History size={19}/>History</button></nav>;
 const recent=(all=false)=><section className="recent-section"><div className="section-heading"><h2>{all?"Completed sessions":"Recent sessions"}</h2>{!all&&history.length>0&&<Button variant="ghost" onClick={()=>setView("history")}>View all <ChevronRight/></Button>}</div>{history.length===0?<div className="history-placeholder"><History size={24}/><div><h3>Your next chapter starts here.</h3><p>Finished sessions will appear here.</p></div></div>:<div className="recent-list">{(all?history:history.slice(0,3)).map(s=><HistoryCard key={s.id} session={s} onOpen={()=>openSummary(s)}/>)}</div>}</section>;
 return <div className="app-shell">
  <header className="site-header"><div className="header-inner"><a href={assetPath("/")} className="brand" aria-label="Steady home"><span className="brand-mark"><Dumbbell size={21}/></span>steady<span className="brand-period">.</span></a>{nav()}</div></header>
  <main className="main-content">
   {storageError&&<div role="alert" className="error-banner">{storageError}</div>}
   {view==="home"?<>
    <div className="page-heading"><p className="eyebrow">ONE SET AT A TIME</p><h1 ref={headingRef} tabIndex={-1}>What’s the plan today?</h1><p>Pick your workout. Find your rhythm.</p></div>
    <Tabs value={category} onValueChange={selectCategory} className="workout-tabs planner-tabs"><TabsList className="category-list" aria-label="Workout categories">{categories.map(c=>{const Icon=categoryIcons[c];return <TabsTrigger key={c} value={c} className="category-tab"><Icon/><span>{c}</span></TabsTrigger>;})}</TabsList>
    {categories.map(c=><TabsContent key={c} value={c}><div className="planner-layout"><section className="plan-card"><div className="plan-title"><span className="plan-icon">{(()=>{const Icon=categoryIcons[c];return <Icon size={28}/>;})()}</span><div><p className="eyebrow">YOUR WORKOUT</p><h2>{c==="Full Body"?"Full body, steady progress.":`${c} day.`}</h2><p>{descriptions[c]}</p></div></div><div className="plan-meta"><span><Dumbbell size={16}/>{workouts[c].length} exercises</span><span><Clock3 size={16}/>{duration(c)} min</span><span><CircleCheck size={16}/>Free weights</span></div><div className="plan-exercises">{workouts[c].map(e=><div key={e.id} className="plan-exercise"><img src={assetPath(`/exercises/${e.image}-1.jpg`)} alt={e.name} width={80} height={64}/><div><h3>{e.name}</h3><p>{e.sets} sets · {e.reps} reps{e.id==="lunge"?" / leg":""}</p></div></div>)}</div></section><aside className="planner-side"><section className="session-panel planning-panel"><p className="eyebrow">{session?"PICK UP WHERE YOU LEFT OFF":"MAKE IT YOUR SESSION"}</p><h2>{session?"You’re already on your way.":"Ready when you are."}</h2><DatePicker value={chosenDate} onChange={changeDate} disabled={!ready}/>{session&&<div className="resume-progress"><span>{completed} of {total} sets complete</span><Progress value={completed/total*100} aria-label="Saved session progress"/></div>}<Button className="primary-action" disabled={!ready} onClick={start}>{session?"Resume session":"Start session"}<ArrowUpRight/></Button><p className="autosave">{storageError?"Saving unavailable":"Saved on this device, as you go."}</p></section><div className="mini-tip"><Leaf size={20}/><p>Start light. Keep a little in the tank.</p></div></aside></div></TabsContent>)}
    </Tabs>{recent()}
   </>:view==="history"?<><div className="page-heading"><p className="eyebrow">YOUR TRAINING LOG</p><h1 ref={headingRef} tabIndex={-1}>Look how far you’ve come.</h1><p>Every session, right here.</p></div>{recent(true)}</>:view==="summary"&&summary?<SessionSummary session={summary} onBack={()=>setView("history")} onHome={()=>setView("home")}/>:view==="workout"&&session&&completed===total?<WorkoutComplete category={category} count={exercises.length} total={total} date={chosenDate} onDate={changeDate} onFinish={finish}/>:exercise&&session?<ExerciseDetail key={exercise.id} exercise={exercise} sets={session.exercises[exercise.id]} onBack={()=>setDetail(null)} onSave={(index,kg,reps,done)=>updateSet(exercise.id,index,kg,reps,done)}/>:<>
    <Button variant="ghost" className="back-button" onClick={()=>setView("home")}><ArrowLeft/>Back to plan</Button><div className="page-heading workout-page-heading"><p className="eyebrow">{chosenDate?formatDate(chosenDate):"YOUR SESSION"}</p><h1 ref={headingRef} tabIndex={-1}>{category} day<span className="title-dot">.</span></h1><p>{descriptions[category]}</p></div>
    <div className="workout-layout"><section className="exercise-section" aria-label={`${category} exercises`}><div className="exercise-groups">{[false,true].map(isDone=>{const group=exercises.filter(e=>session?.exercises[e.id].every(set=>set.done)===isDone);return group.length>0&&<section className={`exercise-group ${isDone?"completed-group":""}`} key={String(isDone)} aria-label={isDone?"Complete exercises":"To do exercises"}><div className="group-heading"><h2>{isDone?<CircleCheck size={19}/>:<Dumbbell size={19}/>} {isDone?"Complete":"To do"}</h2><span>{group.length}</span></div><div className="exercise-grid">{group.map((e)=>{const index=exercises.findIndex(x=>x.id===e.id);const done=session?.exercises[e.id]?.filter(s=>s.done).length??0;const locked=done===e.sets;return <button key={e.id} className={`exercise-card ${locked?"is-complete":""}`} onClick={()=>openExercise(e)} disabled={!ready||locked} aria-label={`${e.name}, ${done} of ${e.sets} sets complete${locked?", locked":""}`}><div className="exercise-image"><img src={assetPath(`/exercises/${e.image}-1.jpg`)} alt={`${e.name} reference${e.photoNote?" — equipment variation":""}`} width={600} height={400}/><span className="exercise-number">{String(index+1).padStart(2,"0")}</span><span className={`equipment-tag ${e.photoNote?"variation-tag":""}`}>{e.id==="squat"?"Kettlebell demo":e.id==="rdl"?"Barbell demo":"Dumbbells"}</span>{locked&&<span className="complete-badge"><Check size={16}/>Complete</span>}</div><div className="card-content"><p className="muscle-label">{e.muscle}</p><h3>{e.name}</h3><div className="prescription"><span>{e.sets} sets <span className="muted-dot">·</span> {e.reps} reps{e.id==="lunge"?" / leg":""}</span><span>{session?.exercises[e.id]?.find(s=>!s.done)?.kg??store.weights[e.id]??e.kg} kg</span></div><div className="card-footer"><span className="set-dots" aria-hidden="true">{Array.from({length:e.sets},(_,i)=><span key={i} className={session?.exercises[e.id]?.[i].done?"done":""}/>)}</span><span>{locked?"All done":done?`${done} of ${e.sets} sets`:"View exercise"}{locked?<LockKeyhole size={14}/>:<ChevronRight size={16}/>}</span></div></div></button>;})}</div></section>;})}</div></section><aside className="session-column"><section className="session-panel"><span className="panel-icon"><Dumbbell size={23}/></span><p className="eyebrow">YOUR SESSION</p><h2>{completed===total?"You did that.":"One set closer."}</h2><div className="session-progress-block"><div className="progress-label"><span>Sets complete</span><strong>{completed}<span> / {total}</span></strong></div><Progress value={completed/total*100} aria-label="Workout completion"/></div><DatePicker value={chosenDate} onChange={changeDate}/><Button className="primary-action" onClick={()=>completed===total?finish():openExercise(exercises.find(e=>session?.exercises[e.id].some(s=>!s.done))??exercises[0])}>{completed===total?<><Check/>Finish session</>:<>Next exercise<ArrowUpRight/></>}</Button><p className="autosave">{storageError?"Saving unavailable":"Your progress saves automatically."}</p></section><div className="mini-tip"><Leaf size={20}/><p>Rest 60–90 seconds between sets.</p></div></aside></div>
   </>}
   <footer className="page-footer"><span><Smartphone size={14}/>No account. Just your progress.</span><span>Made for the long run.</span></footer>
  </main>{nav(true)}{notice&&<div role="status" className="toast"><CircleCheck size={20}/><span>{notice}</span><button aria-label="Dismiss notification" onClick={()=>setNotice("")}><X size={17}/></button></div>}
 </div>;
}
function WorkoutComplete({category,count,total,date,onDate,onFinish}:{category:Category;count:number;total:number;date:string;onDate:(date:string)=>void;onFinish:()=>void}){
 const title=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{title.current?.focus();window.scrollTo({top:0});},[]);
 return <section className="workout-victory"><div className="victory-art" aria-hidden="true"><span className="victory-spark spark-one">✦</span><span className="victory-spark spark-two">✦</span><span className="victory-trophy"><Trophy size={62} strokeWidth={1.5}/></span><span className="victory-check"><Check size={24}/></span></div><p className="eyebrow">EVERY SET. ALL YOU.</p><h1 ref={title} tabIndex={-1}>You showed up.<br/>You got it done.</h1><p className="victory-description">Well done. That’s your {category.toLowerCase()} session complete.</p><div className="victory-totals"><span><Dumbbell size={21}/><strong>{count}</strong> exercises</span><span><CircleCheck size={21}/><strong>{total}</strong> sets</span></div><div className="victory-finish"><DatePicker value={date} onChange={onDate}/><Button className="primary-action" onClick={onFinish}>Finish session <ArrowUpRight/></Button><p className="autosave">Save your session and see your summary.</p></div></section>;
}
function DatePicker({value,onChange,disabled=false}:{value:string;onChange:(date:string)=>void;disabled?:boolean}){
 const [open,setOpen]=useState(false);
 return <div className="session-date"><label>Session date</label><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="outline" className="date-trigger" disabled={disabled} aria-label="Choose session date"><CalendarDays size={18}/><span>{value?(value===localDate()?`Today, ${formatDate(value)}`:formatDate(value)):"Choose a date"}</span><ChevronRight size={15}/></Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl" align="start"><Calendar mode="single" selected={value?new Date(value+"T12:00:00"):undefined} defaultMonth={value?new Date(value+"T12:00:00"):new Date()} disabled={{after:new Date()}} onSelect={date=>{if(date){onChange(localDate(date));setOpen(false);}}}/></PopoverContent></Popover></div>;
}
function HistoryCard({session:s,onOpen}:{session:Session;onOpen:()=>void}){const Icon=categoryIcons[s.category];return <button className="recent-card" onClick={onOpen} aria-label={`View ${s.category} session, ${formatDate(sessionDate(s))}`}><span className="history-icon"><Icon size={22}/></span><span className="recent-title"><strong>{s.category}</strong><span>{formatDate(sessionDate(s))}</span></span><span className="history-complete"><Check size={15}/>{countSets(s)} sets</span><ChevronRight size={18}/></button>;}
function SessionSummary({session:s,onBack,onHome}:{session:Session;onBack:()=>void;onHome:()=>void}){
 const title=useRef<HTMLHeadingElement>(null);useEffect(()=>{title.current?.focus();},[]);
 const reps=Object.values(s.exercises).flat().filter(x=>x.done).reduce((sum,x)=>sum+x.reps,0);
 return <div className="summary-page"><Button variant="ghost" className="back-button" onClick={onBack}><ArrowLeft/>Session history</Button><div className="summary-heading"><span className="summary-trophy"><Trophy size={30}/></span><p className="eyebrow">SESSION COMPLETE</p><h1 ref={title} tabIndex={-1}>A stronger you. Set by set.</h1><p>{s.category} · {formatDate(sessionDate(s))}</p></div><div className="summary-stats"><div><Dumbbell size={20}/><strong>{workouts[s.category].length}</strong><span>exercises</span></div><div><CircleCheck size={20}/><strong>{countSets(s)}</strong><span>sets complete</span></div><div><Layers3 size={20}/><strong>{reps}</strong><span>logged reps</span></div></div><section className="summary-exercises"><div className="section-heading"><h2>Your session, in detail.</h2><span className="summary-unit">kg × reps</span></div>{workouts[s.category].map(e=><article className="summary-exercise" key={e.id}><div className="summary-exercise-top"><img src={assetPath(`/exercises/${e.image}-1.jpg`)} alt={e.name} width={80} height={64}/><div><h3>{e.name}</h3><p>{e.unit}{e.id==="lunge"?" · reps per leg":""}</p></div><CircleCheck size={19}/></div><div className="logged-sets">{s.exercises[e.id].map((set,i)=><span key={i}><small>SET {i+1}</small><strong>{set.kg===0?"BW":`${set.kg} kg`} <span>×</span> {set.reps}</strong></span>)}</div><div className="next-aim"><Target size={18}/><div><strong>Next time</strong><p>{nextAim(e,s.exercises[e.id])}</p></div></div></article>)}</section><Button className="primary-action summary-home" onClick={onHome}>Back to workouts <ArrowUpRight/></Button></div>;
}

function ExerciseDetail({exercise:e,sets,onBack,onSave}:{exercise:Exercise;sets:{kg:number;reps:number;done:boolean}[];onBack:()=>void;onSave:(index:number,kg:number,reps:number,done:boolean)=>void}){
 const next=sets.findIndex(s=>!s.done);
 const [selected,setSelected]=useState(next===-1?0:next);
 const [kg,setKg]=useState(String(sets[selected].kg));
 const [reps,setReps]=useState(String(sets[selected].reps));
 const valid=kg.trim()!==""&&Number.isFinite(Number(kg))&&Number(kg)>=0&&Number(kg)<=500&&/^\d+$/.test(reps)&&Number(reps)>=1&&Number(reps)<=100;
 const titleRef=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{titleRef.current?.focus();},[]);
 function choose(index:number){setSelected(index);setKg(String(sets[index].kg));setReps(String(sets[index].reps));}
 return <div className="detail-page"><Button variant="ghost" className="back-button" onClick={onBack}><ArrowLeft/>Back to workout</Button><div className="detail-heading"><p className="eyebrow">{e.muscle} · DUMBBELLS</p><h1 ref={titleRef} tabIndex={-1}>{e.name}</h1><p>{e.sets} sets · {e.reps} reps{e.id==="lunge"?" per leg":""} · 60–90 sec rest</p></div><div className="detail-layout"><section><div className="form-photos">{[0,1].map(i=><figure key={i}><img src={assetPath(`/exercises/${e.image}-${i}.jpg`)} alt={`${e.name}, ${i===0?"starting":"second"} position`} width={600} height={400}/><figcaption>{i===0?"01 · Start":"02 · Movement"}</figcaption></figure>)}</div>{e.photoNote&&<p className="photo-note">{e.photoNote}</p>}<div className="form-cues"><h2>Make every rep count.</h2><ol>{e.cues.map(cue=><li key={cue}>{cue}</li>)}</ol>{e.note&&<p className="exercise-note"><Info size={18}/>{e.note}</p>}<a className="source-link" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">Reference photos: Free Exercise DB <ArrowUpRight size={13}/></a></div></section><section className="set-panel"><div className="set-heading"><h2>Your sets</h2><span>{sets.filter(s=>s.done).length} / {sets.length} complete</span></div><div className="set-picker">{sets.map((set,i)=><button key={i} onClick={()=>choose(i)} className={`${selected===i?"active":""} ${set.done?"done":""}`} aria-pressed={selected===i}>{set.done?<Check size={18}/>:i+1}<span>Set {i+1}</span></button>)}</div><form onSubmit={event=>{event.preventDefault();if(valid){onSave(selected,Number(kg),Number(reps),true);const following=sets.findIndex((set,i)=>i!==selected&&!set.done);if(following!==-1)choose(following);}}}><div className="weight-control"><label htmlFor="weight">Weight <span>kg · {e.unit}</span></label><div className="stepper"><Button type="button" variant="outline" aria-label="Decrease weight" onClick={()=>setKg(String(Math.max(0,(Number(kg)||0)-1)))}><Minus/></Button><input id="weight" type="number" inputMode="decimal" min="0" max="500" step="0.5" required value={kg} onChange={event=>setKg(event.target.value)}/><Button type="button" variant="outline" aria-label="Increase weight" onClick={()=>setKg(String(Math.min(500,(Number(kg)||0)+1)))}><Plus/></Button></div></div><div className="rep-control"><label htmlFor="reps">Reps {e.id==="lunge"&&<span>per leg</span>}</label><input id="reps" type="number" inputMode="numeric" min="1" max="100" step="1" required value={reps} onChange={event=>setReps(event.target.value)}/></div><p className="weight-hint">Suggested start: {e.kg===0?"bodyweight":`${e.kg} kg ${e.unit}`}. Choose a weight you can control; this isn’t an age-based prescription.</p><Button type="submit" className="primary-action" disabled={!valid}><Check/>{sets[selected].done?"Save completed set":`Complete set ${selected+1}/${sets.length}`}</Button>{sets[selected].done&&<Button type="button" variant="ghost" className="undo-button" onClick={()=>{onSave(selected,sets[selected].kg,sets[selected].reps,false);}}>Mark set as incomplete</Button>}<p className="autosave">One exercise. One set at a time.</p></form></section></div></div>;
}
