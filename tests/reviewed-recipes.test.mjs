import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {recipes, filterRecipes, matchRecipe, totalTime} from '../dist/recipes.js';
const defaults={pantry:[],equipment:[],time:9999,calories:9999,category:'All recipes',sort:'relevant',query:'',onlyHave:false};
const find=id=>recipes.find(r=>r.id===`mealdb-${id}`);
test('40 reviewed recipes all have serving-based facts; 32 are easy',()=>{
 assert.equal(recipes.length,40);assert.equal(new Set(recipes.map(r=>r.id)).size,40);
 assert.equal(recipes.filter(r=>r.easy).length,32);
 for(const r of recipes){
  for(const key of ['prep','cook'])assert.ok(Number.isFinite(r[key])&&r[key]>=0,`${r.id}: ${key}`);
  for(const key of ['kcal','protein','servings'])assert.ok(Number.isFinite(r[key])&&r[key]>0,`${r.id}: ${key}`);
  assert.ok(Number.isInteger(r.servings));
  assert.ok(r.steps.length>=2&&r.ingredients.length>0&&r.nutritionSource&&r.nutritionNote&&r.timingNote);
 }
});
test('every photo is a reviewed local food photograph; video poster uses food too',()=>{
 for(const r of recipes){
  assert.equal(r.photoKind,'food-photograph');assert.equal(r.photoReviewed,true);
  assert.match(r.image,/^\.\/assets\/meals\/\d+\.jpg$/);
  assert.ok(existsSync(new URL(`../dist/${r.image}`,import.meta.url)));
  assert.match(r.photoSource,/themealdb\.com/);
  assert.ok(!/thumbnail|ytimg|youtube/i.test(r.photoCredit));
  assert.match(r.videoId,/^[A-Za-z0-9_-]{11}$/);
 }
 const ui=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 assert.ok(!ui.includes('i.ytimg.com'));
 assert.ok(ui.includes('class="video-poster"')&&ui.includes('src="${esc(r.image)}"'));
});
test('calculated nutrition matches saved USDA profiles, weights and servings',()=>{
 const reviewed=JSON.parse(readFileSync(new URL('../scripts/reviewed-recipes.json',import.meta.url),'utf8'));
 const {foods}=JSON.parse(readFileSync(new URL('../scripts/nutrition-profiles.json',import.meta.url),'utf8'));
 const calculated=reviewed.filter(r=>r.nutritionKind==='calculated');assert.equal(calculated.length,13);
 for(const r of calculated){
  for(const c of r.nutritionComponents){assert.ok(foods[c.profile]?.fdcId);assert.ok(c.grams>0);}
  const sum=key=>r.nutritionComponents.reduce((s,c)=>s+foods[c.profile][key]*c.grams/100,0)/r.servings;
  const live=recipes.find(x=>x.id===r.id);
  assert.equal(live.kcal,Math.floor(sum('kcal')/10+0.5)*10);
  assert.equal(live.protein,Math.floor(sum('protein')+0.5));
 }
 assert.equal(recipes.filter(r=>r.nutritionKind==='publisher').length,27);
});
test('pantry matching hides recipes with zero matching ingredients',()=>{
 const list=filterRecipes(recipes,{...defaults,pantry:['Chicken']});assert.ok(list.length>2);
 assert.ok(list.every(r=>matchRecipe(r,['Chicken']).have>0));
});
test('combined equipment, calorie and total-time filters have useful matches',()=>{
 const list=filterRecipes(recipes,{...defaults,equipment:['Stovetop'],calories:450,time:20});
 assert.ok(list.some(r=>r.id==='mealdb-52955'));
 assert.ok(list.every(r=>r.kcal<=450&&totalTime(r)<=20&&r.equipment.every(e=>e==='Stovetop')));
});
test('make now requires every non-staple ingredient',()=>{
 const r=find(52955),pantry=matchRecipe(r,[]).missing;
 assert.equal(filterRecipes([r],{...defaults,pantry,onlyHave:true}).length,1);
 assert.equal(filterRecipes([r],{...defaults,pantry:pantry.filter(i=>i!=='Peas'),onlyHave:true}).length,0);
});
test('marinating and soaking are included in total-time limits',()=>{
 for(const id of [52945,52785,52946]){
  const r=find(id);assert.equal(totalTime(r),r.prep+r.cook+r.wait);
  assert.equal(filterRecipes([r],{...defaults,time:totalTime(r)-1}).length,0);
  assert.equal(filterRecipes([r],{...defaults,time:totalTime(r)}).length,1);
 }
});
test('easy and quick filters reflect difficulty and complete duration',()=>{
 assert.equal(filterRecipes(recipes,{...defaults,category:'Easy meals'}).length,32);
 const quick=filterRecipes(recipes,{...defaults,category:'Quick & easy'});
 assert.ok(quick.length>=10);assert.ok(quick.every(r=>r.easy&&totalTime(r)<=30));
 assert.ok(!quick.some(r=>r.id==='mealdb-52945'));
});
test('time and nutrition sorting remain numerical',()=>{
 for(const sort of ['time','calories']){
  const list=filterRecipes(recipes,{...defaults,sort});const value=r=>sort==='time'?totalTime(r):r.kcal;
  assert.ok(list.every((r,i)=>!i||value(list[i-1])<=value(r)));
 }
 assert.ok(filterRecipes(recipes,{...defaults,category:'High protein'}).every(r=>r.protein>=25));
});
test('unknown future metadata cannot pass finite limits',()=>{
 const unknown={...find(52955),prep:null,kcal:null,protein:null};
 for(const filters of [{time:60},{calories:650},{category:'High protein'}])assert.equal(filterRecipes([unknown],{...defaults,...filters}).length,0);
});
test('Asian search combines with ingredient and equipment filters',()=>{
 const asian=filterRecipes(recipes,{...defaults,category:'Asian'});
 for(const area of ['Malaysian','Japanese','Chinese','Thai','India'])assert.ok(asian.some(r=>r.area===area));
 const list=filterRecipes(recipes,{...defaults,category:'Asian',query:'egg drop',pantry:['Eggs'],equipment:['Stovetop']});
 assert.deepEqual(list.map(r=>r.id),['mealdb-52955']);
 assert.equal(filterRecipes(recipes,{...defaults,category:'Asian',query:'egg drop',equipment:['Oven']}).length,0);
});
test('ingredient corrections fix misleading pantry and dietary matches',()=>{
 const soup=find(52955);assert.ok(matchRecipe(soup,[]).missing.includes('Peas'));
 assert.equal(soup.ingredients.filter(i=>i[0]==='Sesame oil').length,1);
 assert.equal(filterRecipes([soup],{...defaults,category:'Vegetarian'}).length,0);
 assert.ok(find(52852).ingredients.some(i=>i[0]==='Sundried tomatoes'));
 assert.ok(find(52871).ingredients.some(i=>i[0]==='Vegetarian worcestershire sauce'));
 assert.ok(find(52827).ingredients.some(i=>i[0]==='Coconut milk'));
});
test('equipment follows the actual method rather than keyword matches',()=>{
 assert.deepEqual(find(52855).equipment,['Stovetop']);
 assert.equal(filterRecipes([find(52959)],{...defaults,equipment:['Oven']}).length,0);
 assert.equal(filterRecipes([find(52870)],{...defaults,equipment:['Oven','Stovetop']}).length,1);
 assert.deepEqual(find(52911).equipment,['Stovetop']);
});
test('batch ingredient quantities are explicitly separated from per-serving nutrition',()=>{
 assert.ok(recipes.every(r=>r.sourceQuantities&&r.ingredients.every(i=>i[1]===null)));
 const ui=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 assert.ok(ui.includes('Ingredient quantities below are for the whole recipe.'));
 assert.ok(ui.includes('Makes ${r.servings} servings'));
});
