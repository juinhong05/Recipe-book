"""Import a curated snapshot from official TheMealDB API responses.
Run with an API response JSON path. Does not fabricate nutrition, yield or timing.
"""
import json, re, sys, pathlib, subprocess, concurrent.futures
ROOT=pathlib.Path(__file__).resolve().parents[1]
overrides_path=ROOT/'scripts'/'media-overrides.json'
overrides=json.loads(overrides_path.read_text(encoding='utf-8')) if overrides_path.exists() else {}
meals=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
append_mode='--append' in sys.argv[2:]
existing_records=[]; existing_media={}
if append_mode:
 snapshot=(ROOT/'dist'/'catalogue.js').read_text(encoding='utf-8')
 recipe_json,media_json=snapshot.split(';\nexport const originalMedia = ',1)
 existing_records=json.loads(recipe_json.removeprefix('export const communityRecipes = '))
 existing_media=json.loads(media_json.rstrip().removesuffix(';'))
def video_id(url):
 m=re.search(r'(?:[?&]v=|youtu\.be/|/shorts/)([A-Za-z0-9_-]{11})(?:[?&/]|$)',url or '')
 return m[1] if m else None
aliases={'tomatoes':'Tomato','chopped tomatoes':'Tomato','cherry tomatoes':'Tomato','tinned tomatoes':'Tomato','garlic clove':'Garlic','garlic cloves':'Garlic','onions':'Onion','egg':'Eggs','carrots':'Carrot','olive oil':'Olive oil','oil':'Olive oil','vegetable oil':'Olive oil','sunflower oil':'Olive oil','penne rigate':'Pasta','spaghetti':'Pasta','penne':'Pasta','linguine pasta':'Pasta','chicken breast':'Chicken','chicken breasts':'Chicken','chicken':'Chicken','milk':'Milk','yoghurt':'Yogurt','greek yogurt':'Yogurt','plain yogurt':'Yogurt','lemon juice':'Lemon','lime juice':'Lime','parmesan cheese':'Parmesan','parmigiano-reggiano':'Parmesan','basmati rice':'Rice','white rice':'Rice','cannellini beans':'White beans','butter beans':'White beans','potatoes':'Potato','sweet potatoes':'Sweet potato','spring onions':'Spring onion','green onions':'Spring onion','soy sauce':'Soy sauce','black pepper':'Pepper','white pepper':'Pepper','sea salt':'Salt','kosher salt':'Salt'}
def canonical(name):
 name=re.sub(r'\s+',' ',name).strip()
 return aliases.get(name.lower(),name[:1].upper()+name[1:].lower())
def equipment(method):
 text=method.lower(); result=[]
 for name,pattern in [('Oven',r'\boven\b|\bbak(?:e|ing)\b|\broast\b'),('Stovetop',r'\b(?:saucepan|skillet|wok|hob|stove|griddle pan|frying pan|fry|boil|simmer|saute|saut\w+)\b'),('Blender',r'\bblender\b'),('Food processor',r'\bfood processor\b'),('Slow cooker',r'\bslow cooker\b|\bcrock.?pot\b'),('Grill',r'\bbarbecue\b|\bbbq\b'),('Microwave',r'\bmicrowave\b')]:
  if re.search(pattern,text):result.append(name)
 return result or None
def steps(text):
 text=text.replace('\r','').strip()
 parts=re.split(r'\n\s*\n|\n(?=STEP\s+\d|\d+[.)]\s)',text,flags=re.I)
 if len(parts)<3:parts=re.split(r'\n+',text)
 if len(parts)<3:parts=re.split(r'(?<=[.!?])\s+(?=[A-Z])',text)
 out=[]
 for p in parts:
  p=p.strip()
  if not p:continue
  header=re.match(r'^(?:STEP\s+\d+\s*[-:.]?\s*)([^\n]+)\n(.*)',p,re.I|re.S)
  if header:title=header[1].strip().capitalize();body=header[2].strip()
  else:title=f'Step {len(out)+1}';body=re.sub(r'^\d+[.)]\s*','',p)
  out.append([title,re.sub(r'\s+',' ',body)])
 return out
eligible=[m for m in meals if int(m['idMeal'])<53000 and video_id(m.get('strYoutube')) and len(m.get('strInstructions') or '')>150 and m.get('strMealThumb')]
# Lead with everyday meals; keep a balanced selection of cuisines and dishes.
preferred=['52771','52963','52814','52956','52952','52870','52960','52949','52867','52774','52855','52953','52841','52872','52807','52982','52770','52852','52869','52863','52775','52959','52819','52940','52831','52850','52795','52842']
by_id={m['idMeal']:m for m in eligible}; chosen=[by_id[i] for i in preferred if i in by_id]
for m in sorted(eligible,key=lambda m:(m['strCategory']=='Dessert',m['strMeal'])):
 if m not in chosen and len(chosen)<88:chosen.append(m)
if append_mode:
 chosen=eligible
 if len(chosen)!=len(meals):raise ValueError('Every appended recipe needs a photo, instructions and a video reference')
else:
 assert len(chosen)==88
records=[];photos=[]
for m in chosen:
 ing=[]
 for i in range(1,21):
  name=(m.get(f'strIngredient{i}') or '').strip();measure=(m.get(f'strMeasure{i}') or '').strip()
  if name:ing.append([canonical(name),None,measure,name])
 r={'id':'mealdb-'+m['idMeal'],'title':m['strMeal'].strip(),'description':f"{m['strArea']} cooking, from the TheMealDB community. Follow the original ingredient quantities and cooking method below.",'image':f"./assets/meals/{m['idMeal']}.jpg",'photoCredit':'TheMealDB community','photoSource':f"https://www.themealdb.com/meal/{m['idMeal']}",'prep':None,'cook':None,'kcal':None,'protein':None,'category':'Vegetarian' if m['strCategory'] in ['Vegetarian','Vegan'] else m['strCategory'],'area':m['strArea'],'equipment':equipment(m['strInstructions']),'equipmentInferred':True,'ingredients':ing,'steps':steps(m['strInstructions']),'sourceUrl':f"https://www.themealdb.com/meal/{m['idMeal']}",'originalSource':m.get('strSource') or None,'sourceQuantities':True,'videoId':video_id(m['strYoutube']),'videoNote':'Community-linked tutorial. Follow the written recipe for ingredient quantities.','mediaOriginalUrl':m['strMealThumb']}
 r.update(overrides.get(r['id'],{}))
 records.append(r);photos.append((m['strMealThumb'],ROOT/'dist'/r['image'][2:]))
videos={
 'chicken-bowl':('skpQERSTTrc','TIFFYCOOKS'),
 'tomato-pasta':('1IszT_guI08','TheMealDB linked tutorial'),
 'fried-rice':('SsuFmw9s5w4','caribbeanpot'),
 'chickpea-salad':('EagQ22jwt_4','Clean & Delicious'),
 'omelette':('Pw1RNJ2xAXw','The Sweetest Journey'),
 'salmon':('xvPR2Tfw5k0','TheMealDB linked tutorial'),
 'tofu-noodles':('KYvdfNrl3Yc','The Picky Eater'),
 'bean-stew':('wHGzMcLkIW4',"Uncle Hajji’s Kitchen"),
 'avocado-toast':('9KzA4LnBB44','Lily Leung / FullHappyBelly'),
 'sweet-potato':('IrytV85XH9g','The Mediterranean Dish'),
 'chicken-stirfry':('JvcRpbXjNm0','Cooking tutorial'),
 'overnight-oats':('ZoBxQ4FuETs','Filling Meals')}
media={}
for key,(vid,credit) in videos.items():
 if append_mode:continue
 url=f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg'
 media[key]={'image':f'./assets/meals/{key}.jpg','photoCredit':credit+' · tutorial thumbnail','photoSource':f'https://www.youtube.com/watch?v={vid}','videoId':vid,'videoNote':'Related cooking tutorial. Ingredients and portions may differ from our written recipe.'}
 media[key].update(overrides.get(key,{}))
 url=f"https://i.ytimg.com/vi/{media[key]['videoId']}/hqdefault.jpg"
 photos.append((url,ROOT/'dist'/'assets'/'meals'/f'{key}.jpg'))
if append_mode:
 # Keep saved IDs stable and make repeat imports idempotent.
 updates={r['id']:r for r in records}
 records=[updates.pop(r['id'],r) for r in existing_records]+list(updates.values())
 media=existing_media
(ROOT/'dist'/'assets'/'meals').mkdir(parents=True,exist_ok=True)
def download(item):
 url,path=item
 result=subprocess.run(['curl.exe','-fsSL','--max-time','25','--retry','1',url,'-o',str(path)],capture_output=True)
 return {'file':path.name,'ok':result.returncode==0 and path.exists() and path.stat().st_size>1000}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:status=list(pool.map(download,photos))
print(json.dumps({'imported':len(records),'photos':len(status),'failed':[s for s in status if not s['ok']]},indent=2))
if any(not s['ok'] for s in status):sys.exit(1)
out=ROOT/'dist'/'catalogue.js'
out.write_text('export const communityRecipes = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const originalMedia = '+json.dumps(media,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
