import test from 'node:test';import assert from 'node:assert/strict';import {recipes,filterRecipes,matchRecipe,totalTime} from '../dist/recipes.js';
const defaults={pantry:[],equipment:[],time:9999,calories:9999,category:'All recipes',sort:'relevant',query:'',onlyHave:false};
test('pantry matching ranks relevant recipes and hides zero matches',()=>{const list=filterRecipes(recipes,{...defaults,pantry:['Chicken']});assert.ok(list.length>2);assert.ok(list.every(r=>matchRecipe(r,['Chicken']).have>0));});
test('combined equipment, calorie and time constraints are respected',()=>{const list=filterRecipes(recipes,{...defaults,equipment:['Stovetop'],calories:450,time:20});assert.ok(list.length>0);assert.ok(list.every(r=>r.kcal<=450&&totalTime(r)<=20&&r.equipment.every(e=>e==='Stovetop')));assert.ok(!list.some(r=>r.id==='salmon'));});
test('make now requires all non-staple ingredients',()=>{const pantry=['Eggs','Spinach','Mushrooms','Milk'];assert.deepEqual(filterRecipes(recipes,{...defaults,pantry,onlyHave:true}).map(r=>r.id),['omelette']);assert.equal(filterRecipes(recipes,{...defaults,pantry:['Eggs'],onlyHave:true}).length,0);});
test('overnight waiting time is included in time limits',()=>{assert.equal(totalTime(recipes.find(r=>r.id==='overnight-oats')),245);assert.ok(!filterRecipes(recipes,{...defaults,time:30}).some(r=>r.id==='overnight-oats'));});
test('vegetarian and high protein categories respect their definitions',()=>{assert.ok(filterRecipes(recipes,{...defaults,category:'Vegetarian'}).every(r=>r.category==='Vegetarian'));assert.ok(filterRecipes(recipes,{...defaults,category:'High protein'}).every(r=>r.protein>=25));});
test('search, calorie sorting and complete recipe data',()=>{assert.ok(filterRecipes(recipes,{...defaults,query:'salmon'}).length>1);const list=filterRecipes(recipes,{...defaults,sort:'calories'});assert.equal(list[0].id,'omelette');assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);assert.ok(recipes.every(r=>r.steps.length>=1&&r.ingredients.length>0&&(r.kcal===null||r.kcal>0)));});

test('catalogue contains 116 unique recipes with real media and valid video references',()=>{assert.equal(recipes.length,116);assert.equal(new Set(recipes.map(r=>r.id)).size,116);assert.ok(recipes.every(r=>/^\.\/assets\/meals\/.+\.jpg$/.test(r.image)&&r.photoCredit&&r.photoSource));assert.ok(recipes.every(r=>/^[A-Za-z0-9_-]{11}$/.test(r.videoId)));});
test('unknown nutrition and timing never pass a finite limit',()=>{const imported=recipes.filter(r=>r.sourceQuantities);assert.equal(filterRecipes(imported,{...defaults}).length,104);assert.equal(filterRecipes(imported,{...defaults,calories:650}).length,0);assert.equal(filterRecipes(imported,{...defaults,time:60}).length,0);assert.equal(filterRecipes(imported,{...defaults,category:'High protein'}).length,0);});
test('ingredient aliases allow pantry matches without losing original ingredient details',()=>{const r=recipes.find(r=>r.id==='mealdb-52771');assert.ok(matchRecipe(r,['Pasta','Tomato','Garlic']).have===3);assert.ok(r.ingredients.some(i=>i[0]==='Tomato'&&i[3]==='chopped tomatoes'));});
test('imported recipe original measurements are not treated as one serving',()=>{assert.ok(recipes.filter(r=>r.sourceQuantities).every(r=>r.ingredients.every(i=>i[1]===null)&&r.kcal===null));});

test("griddle cooking requires a stovetop as well as the oven",()=>{const r=recipes.find(r=>r.id==="mealdb-52870");assert.ok(r.equipment.includes("Stovetop"));assert.equal(filterRecipes([r],{...defaults,equipment:["Oven"]}).length,0);assert.equal(filterRecipes([r],{...defaults,equipment:["Oven","Stovetop"]}).length,1);});

test('Asian collection supports cuisine search and combined pantry/equipment filters',()=>{
 const asian=filterRecipes(recipes,{...defaults,category:'Asian'});
 for(const area of ['Malaysian','Japanese','Chinese','Thai','Vietnamese','India'])assert.ok(asian.some(r=>r.area===area));
 assert.ok(!asian.some(r=>r.id==='mealdb-52771'));
 assert.deepEqual(filterRecipes(recipes,{...defaults,category:'Asian',query:'Malaysian'}).map(r=>r.id),['mealdb-52821']);
 const soup=filterRecipes(recipes,{...defaults,category:'Asian',query:'egg drop',pantry:['Eggs'],equipment:['Stovetop']});
 assert.deepEqual(soup.map(r=>r.id),['mealdb-52955']);
 assert.equal(filterRecipes(recipes,{...defaults,category:'Asian',query:'egg drop',equipment:['Oven']}).length,0);
});

test('Asian ingredient corrections prevent misleading dietary and pantry matches',()=>{
 const soup=recipes.find(r=>r.id==='mealdb-52955');
 assert.ok(soup.ingredients.some(i=>i[0]==='Eggs'));
 assert.equal(filterRecipes([soup],{...defaults,category:'Vegetarian'}).length,0);
 const biryani=recipes.find(r=>r.id==='mealdb-52805');
 for(const ingredient of ['Milk','Tomato','Green chilli'])assert.ok(matchRecipe(biryani,[]).missing.includes(ingredient));
 const udon=recipes.find(r=>r.id==='mealdb-52871');
 assert.ok(udon.ingredients.some(i=>i[0]==='Vegetarian worcestershire sauce'));
});
