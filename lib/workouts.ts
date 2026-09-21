export type Category = "Push" | "Pull" | "Legs" | "Full Body";
export type Exercise = { id: string; name: string; muscle: string; kg: number; unit: string; reps: number; sets: number; image: string; note?: string; photoNote?: string; cues: string[] };
export const categories: Category[] = ["Push", "Pull", "Legs", "Full Body"];
export const descriptions = {Push: "Chest, shoulders & triceps", Pull: "Back & biceps", Legs: "Quads, hamstrings & glutes", "Full Body": "A little of everything"};
const splitWorkouts = {
 Push: [
 {id:"incline",name:"Incline chest press",muscle:"Upper chest",kg:6,unit:"per dumbbell",reps:12,sets:3,image:"Incline_Dumbbell_Press",cues:["Set the bench to a gentle incline, around 30°. Keep both feet planted.","Start with the dumbbells beside your chest and wrists above elbows.","Press up smoothly, then lower slowly. Keep shoulders against the bench."]},
 {id:"shoulder",name:"Shoulder press",muscle:"Shoulders",kg:4,unit:"per dumbbell",reps:12,sets:3,image:"Dumbbell_Shoulder_Press",cues:["Sit with your back supported and feet flat on the floor.","Start with dumbbells at shoulder height, elbows slightly forward.","Press overhead without arching your back. Lower with control."]},
 {id:"fly",name:"Incline dumbbell fly",muscle:"Upper chest",kg:2,unit:"per dumbbell",reps:12,sets:3,image:"Incline_Dumbbell_Flyes",note:"Free-weight alternative to low-to-high cable flies. The resistance feels different; use a light load.",cues:["Lie on a low incline bench, weights above your chest, palms facing.","Keep a soft bend in your elbows. Open your arms in a wide arc.","Stop before your shoulders feel strained, then bring the weights together."]},
 {id:"triceps",name:"Overhead tricep extension",muscle:"Triceps",kg:4,unit:"one dumbbell · total",reps:12,sets:3,image:"Standing_Dumbbell_Triceps_Extension",note:"Free-weight alternative to the cable tricep pushdown.",cues:["Hold one dumbbell with both hands above your head. Keep your ribs down.","Bend your elbows to lower the weight behind your head without flaring them.","Straighten your elbows smoothly. Keep your upper arms still."]}],
 Pull: [
 {id:"pullover",name:"Dumbbell pullover",muscle:"Lats & chest",kg:4,unit:"one dumbbell · total",reps:12,sets:3,image:"Straight-Arm_Dumbbell_Pullover",note:"Free-weight option for training the lats. This is not an exact replacement for a vertical pulldown.",cues:["Lie along a flat bench with your head supported and feet planted.","Hold one dumbbell above your chest with a slight bend in your elbows.","Lower behind your head only as far as comfortable; keep ribs down. Return above your chest."]},
 {id:"row",name:"Bent-over row",muscle:"Back",kg:6,unit:"per dumbbell",reps:12,sets:3,image:"Bent_Over_Two-Dumbbell_Row",cues:["Soften your knees and hinge at your hips. Keep your back neutral.","Let the dumbbells hang under your shoulders, then pull toward your hips.","Keep your torso still. Lower the weights slowly without rounding your back."]},
 {id:"curl",name:"Bicep curl",muscle:"Biceps",kg:4,unit:"per dumbbell",reps:12,sets:3,image:"Dumbbell_Bicep_Curl",cues:["Stand tall, holding a dumbbell in each hand with palms forward.","Keep elbows near your sides as you curl the weights upward.","Lower slowly. Avoid swinging or leaning back."]}],
 Legs: [
 {id:"squat",name:"Goblet squat",muscle:"Quads & glutes",kg:6,unit:"one dumbbell · total",reps:12,sets:3,image:"Goblet_Squat",photoNote:"Photo shows the kettlebell variation. Hold one dumbbell vertically by its upper end for your version.",note:"Use one dumbbell at your chest. A barbell squat is a later progression with a different setup; learn it with a trainer.",cues:["Hold one dumbbell close to your chest, feet around shoulder-width apart.","Sit down between your hips, keeping your heels planted and knees in line with toes.","Squat only as low as you can with control, then push the floor away to stand."]},
 {id:"rdl",name:"Romanian deadlift",muscle:"Hamstrings & glutes",kg:6,unit:"per dumbbell",reps:12,sets:3,image:"Romanian_Deadlift",photoNote:"Photo shows the barbell variation. Your starting weight is for two dumbbells, one in each hand.",cues:["Stand tall with dumbbells in front of your thighs and knees slightly bent.","Push your hips back, keeping the weights close to your legs and your spine neutral.","Stop when you feel a hamstring stretch, then drive your hips forward to stand. No need to reach the floor."]},
 {id:"lunge",name:"Walking lunges",muscle:"Quads & glutes",kg:0,unit:"per dumbbell · 0 = bodyweight",reps:10,sets:3,image:"Dumbbell_Lunges",note:"Reps are per leg. Start with bodyweight; add light dumbbells once your balance feels steady.",cues:["Stand tall and take a comfortable step forward.","Bend both knees, lowering your back knee toward the floor without hitting it.","Push through your front foot and step through into the next lunge. Keep your front knee tracking over your toes."]}]
};
export const workouts: Record<Category, Exercise[]> = {...splitWorkouts, "Full Body": [splitWorkouts.Legs[0], splitWorkouts.Push[0], splitWorkouts.Pull[1], splitWorkouts.Legs[1]]};
export const duration = (category:Category) => category==="Full Body"?"35–45":category==="Push"?"35–45":"25–35";
export const localDate = (date=new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export const validDate = (value:unknown): value is string => typeof value==="string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+"T12:00:00")) && localDate(new Date(value+"T12:00:00"))===value;
export const sessionDate = (s:Session) => s.date ?? localDate(new Date(s.finishedAt??s.startedAt));
export const formatDate = (date:string) => new Date(date+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
export const sortedHistory = (sessions:Session[]) => [...sessions].sort((a,b)=>sessionDate(b).localeCompare(sessionDate(a))||b.startedAt.localeCompare(a.startedAt));
export function nextAim(e:Exercise,sets:LoggedSet[]):string {
 const logged=sets.filter(s=>s.done);if(!logged.length)return `${e.sets} × ${e.reps} controlled reps.`;
 const weight=Math.min(...logged.map(s=>s.kg));
 const load=weight===0?"bodyweight":`${weight} kg${e.unit.startsWith("per dumbbell")?" each":" total"}`;
 if(logged.length<e.sets||logged.some(s=>s.reps<e.reps))return `Aim for ${e.sets} × ${e.reps}${e.id==="lunge"?" / leg":""} at ${load}.`;
 return `Repeat at ${load}. If every set felt easy, try the smallest weight increase.`;
}
export type LoggedSet = {kg:number; reps:number; done:boolean};
export type Session = {id:string; category:Category; startedAt:string; date?:string; finishedAt?:string; exercises:Record<string,LoggedSet[]>};
export type Store = {version:1; selected:Category; active:Partial<Record<Category,Session>>; history:Session[]; weights:Record<string,number>};
export const emptyStore = ():Store => ({version:1,selected:"Push",active:{},history:[],weights:{}});
export function newSession(category:Category, weights:Record<string,number>, date=localDate()):Session {if(!validDate(date))throw new Error("Invalid session date");return {id:crypto.randomUUID(),category,date,startedAt:new Date().toISOString(),exercises:Object.fromEntries(workouts[category].map(e=>[e.id,Array.from({length:e.sets},()=>({kg:weights[e.id]??e.kg,reps:e.reps,done:false}))]))};}
export const countSets = (s?:Session) => s ? Object.values(s.exercises).flat().filter(x=>x.done).length : 0;
export function isStore(value:unknown):value is Store {
 if (!value || typeof value!=="object") return false;
 const s=value as Store;
 if(s.version!==1||!categories.includes(s.selected)||!s.active||typeof s.active!=="object"||!Array.isArray(s.history)||!s.weights||typeof s.weights!=="object")return false;
 const validSession=(x:Session)=>x&&categories.includes(x.category)&&(x.date===undefined||validDate(x.date))&&typeof x.id==="string"&&typeof x.startedAt==="string"&&Number.isFinite(Date.parse(x.startedAt))&&(!x.finishedAt||Number.isFinite(Date.parse(x.finishedAt)))&&x.exercises&&workouts[x.category].every(e=>Array.isArray(x.exercises[e.id])&&x.exercises[e.id].length===e.sets&&x.exercises[e.id].every(a=>a&&typeof a.done==="boolean"&&Number.isFinite(a.kg)&&a.kg>=0&&a.kg<=500&&Number.isInteger(a.reps)&&a.reps>=1&&a.reps<=100));
 return Object.entries(s.active).every(([c,x])=>categories.includes(c as Category)&&validSession(x)&&x.category===c)&&s.history.every(validSession)&&Object.values(s.weights).every(x=>Number.isFinite(x)&&x>=0&&x<=500);
}
