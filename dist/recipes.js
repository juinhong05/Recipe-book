import {communityRecipes} from './catalogue.js';
export const recipes = communityRecipes;
export const staples = ['Olive oil','Salt','Pepper','Water'];
const asianAreas = new Set(['Chinese','Japanese','Malaysian','Thai','Vietnamese','India','Indian','Korean','Filipino','Indonesian','Singaporean','Taiwanese','Pakistani','Bangladeshi','Sri Lankan','Nepalese','Turkish']);
export const isAsianRecipe = r => asianAreas.has(r.area);
export const ingredients = [...new Set(recipes.flatMap(r=>r.ingredients.map(i=>i[0])))].filter(i=>!staples.includes(i)).sort();
export const totalTime = r => Number.isFinite(r.prep)&&Number.isFinite(r.cook)?r.prep+r.cook+(r.wait||0):Infinity;
export function matchRecipe(r, pantry) {
 const needed=[...new Set(r.ingredients.map(i=>i[0]).filter(i=>!staples.includes(i)))];
 const have=needed.filter(i=>pantry.includes(i));
 return {have:have.length,total:needed.length,missing:needed.filter(i=>!pantry.includes(i)),ratio:needed.length?have.length/needed.length:1};
}
export function filterRecipes(list, f) {
 const q=(f.query||'').trim().toLowerCase();
 return list.filter(r=>{
  const m=matchRecipe(r,f.pantry);
  return (!q||[r.title,r.area||'',...r.ingredients.flatMap(i=>[i[0],i[3]||''])].some(s=>s.toLowerCase().includes(q)))
   &&(!f.pantry.length||m.have>0)&&(!f.onlyHave||m.missing.length===0)
   &&(!f.equipment.length||(Array.isArray(r.equipment)&&r.equipment.every(e=>f.equipment.includes(e))))
   &&(Number(f.time)>=9999||totalTime(r)<=Number(f.time))
   &&(Number(f.calories)>=9999||(Number.isFinite(r.kcal)&&r.kcal<=Number(f.calories)))
   &&(f.category==='All recipes'||(f.category==='Asian'?isAsianRecipe(r):f.category==='Easy meals'?r.easy:f.category==='Quick & easy'?r.easy&&totalTime(r)<=30:f.category==='High protein'?Number.isFinite(r.protein)&&r.protein>=25:f.category==='Vegetarian'?r.category==='Vegetarian':f.category==='With video'?Boolean(r.videoId):r.category===f.category));
 }).sort((a,b)=>f.sort==='time'?totalTime(a)-totalTime(b):f.sort==='calories'?(a.kcal??Infinity)-(b.kcal??Infinity):matchRecipe(b,f.pantry).ratio-matchRecipe(a,f.pantry).ratio);
}
