import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base=process.env.PREVIEW_BASE ?? "http://localhost:3100";
if(!["localhost","127.0.0.1"].includes(new URL(base).hostname))throw new Error("Use a local server");
const ctx={exports:{}};
vm.runInNewContext(ts.transpileModule(readFileSync("src/templates/pine-ridge-lodge/translations.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,ctx);
const t=(text,lang)=>lang==='en'?text:ctx.exports.copy[text][lang==='tl'?0:1];

test("Pine Ridge languages, seasons, mobile planning and sample completion",{timeout:180_000},async()=>{
 const browser=await chromium.launch({channel:"chrome",headless:true});
 try{
  const page=await browser.newPage({viewport:{width:360,height:800}});page.setDefaultTimeout(12_000);
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const routes=[['','First tracks, then the fire.'],['/activities','Activities'],['/rooms','Rooms'],['/rooms/trapper-twin','Trapper Twin'],['/rooms/hearth-room','Hearth Room'],['/rooms/family-loft','Family Loft'],['/rooms/ridge-chalet','Ridge Chalet'],['/dining','Dining'],['/journal','Lodge journal'],['/journal/how-to-dress-for-a-bluebird-day','How to dress for a bluebird day'],['/journal/larch-season-is-coming','Larch season is coming'],['/contact','Contact'],['/credits','Photo credits'],['/book','Plan a sample stay']];
  for(const language of ['en','tl','taglish'])for(const[path,heading]of routes){
   await page.goto(`${base}/demo/pine-ridge-lodge${path}?lang=${language}&season=winter`,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{level:1,name:t(heading,language),exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${language} ${path} overflows`);
   const links=await page.locator('[data-template="pine-ridge-lodge"] a[href^="/demo/pine-ridge-lodge"]').evaluateAll(nodes=>nodes.map(n=>n.href));
   assert.ok(links.every(s=>new URL(s).searchParams.get('lang')===language && new URL(s).searchParams.get('season')==='winter'),`${path} loses language/season`);
  }
  await page.goto(`${base}/demo/pine-ridge-lodge?lang=tl`,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:t('Summer','tl'),exact:true}).click();
  await page.getByRole('heading',{name:t('Long trails, cold lakes, warm beds.','tl'),exact:true}).waitFor();
  await page.getByRole('link',{name:t('Explore this season','tl'),exact:true}).click();
  const plan=page.locator('#plan');
  await plan.getByRole('combobox',{name:t('Activity level','tl'),exact:true}).selectOption('strong');
  await plan.getByText(t('No activities match this level in this season.','tl')).waitFor();
  await plan.getByRole('button',{name:t('Show all levels','tl')}).click();
  await plan.getByRole('combobox',{name:t('Guests','tl'),exact:true}).selectOption('5');
  assert.equal(await plan.locator('article').count(),1);
  const activity=plan.locator('li').filter({has:page.getByRole('heading',{name:t('Sunrise paddle','tl'),exact:true})});
  await activity.getByRole('button').click();
  await activity.getByRole('button',{name:t('Added to your plan','tl')}).waitFor();
  const roomLink=plan.getByRole('link',{name:t('View room','tl'),exact:true});
  await roomLink.click();
  const book=page.getByRole('link',{name:t('Check dates','tl'),exact:true});
  const target=new URL(await book.getAttribute('href'),base);
  assert.equal(target.searchParams.get('season'),'summer');assert.equal(target.searchParams.get('activity'),'paddle');assert.equal(target.searchParams.get('guests'),'5');
  // Find one deterministic sample night for the single six-person chalet.
  let found=false;
  for(let day=1;day<=8;day++){
   target.searchParams.set('checkin',`2027-07-${String(day).padStart(2,'0')}`);target.searchParams.set('checkout',`2027-07-${String(day+1).padStart(2,'0')}`);
   await page.goto(target.href,{waitUntil:'domcontentloaded'});
   await page.getByRole('heading',{name:t('Choose a room','tl'),exact:true}).waitFor();
   const room=page.getByRole('button',{name:new RegExp(t('Ridge Chalet','tl'))});
   if(await room.isEnabled()){await room.click();found=true;break;}
  }
  assert.ok(found,'No sample chalet night found');
  await page.getByRole('button',{name:t('Continue','tl'),exact:true}).click();
  await page.locator('[name="name"]').fill('Sample Guest');
  await page.getByRole('combobox',{name:t('Language','tl'),exact:true}).selectOption('taglish');
  assert.equal(await page.locator('[name="name"]').inputValue(),'Sample Guest');
  await page.locator('[name="email"]').fill('sample@example.com');await page.locator('[name="phone"]').fill('09000000000');
  assert.equal(await page.getByText(t('Ridge lift pass, daily per guest','taglish'),{exact:true}).count(),0);
  const extras=page.locator('#details-form input[type="checkbox"]');assert.equal(await extras.count(),2);await extras.nth(0).check();await extras.nth(1).check();
  await page.getByRole('button',{name:t('Review','taglish'),exact:true}).click();
  await page.getByText(/1,089/).waitFor();
  await page.getByRole('button',{name:t('Finish sample stay','taglish'),exact:true}).click();
  await page.getByRole('status').filter({hasText:t('Your sample stay is ready.','taglish')}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'confirmation overflows');
  await page.goto(`${base}/demo/pine-ridge-lodge/book?season=winter&checkin=2027-07-01&checkout=2027-07-02`,{waitUntil:'domcontentloaded'});
  await page.getByRole('alert').filter({hasText:'entirely within the selected season'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Continue',exact:true}).isDisabled(),true);

  await page.goto(`${base}/demo/pine-ridge-lodge/contact?lang=tl&season=summer`,{waitUntil:'domcontentloaded'});
  await page.locator('[name="name"]').fill('Sample Guest');await page.locator('[name="email"]').fill('invalid');
  await page.getByRole('button',{name:t('Try sample request','tl')}).click();
  assert.equal(await page.locator('[name="email"]').evaluate(e=>e.validationMessage),t('Please enter a valid value.','tl'));
  await page.getByRole('combobox',{name:t('Language','tl'),exact:true}).selectOption('taglish');
  assert.equal(await page.locator('[name="name"]').inputValue(),'Sample Guest');
  await page.locator('[name="email"]').fill('sample@example.com');await page.getByRole('button',{name:t('Try sample request','taglish')}).click();
  await page.getByRole('status').filter({hasText:t('No request was sent and no gear or guide was reserved.','taglish')}).waitFor();

  await page.setViewportSize({width:1366,height:900});
  await page.goto(`${base}/preview/pine-ridge-lodge?season=summer&lang=tl`,{waitUntil:'domcontentloaded'});
  const frame=page.frameLocator('iframe');
  await frame.getByRole('heading',{name:t('Long trails, cold lakes, warm beds.','tl'),exact:true}).waitFor();
  await frame.locator('body').evaluate(b=>{b.dataset.preserved='yes';});
  await page.getByRole('button',{name:'mobile',exact:true}).click();await page.getByLabel('Preview language').selectOption('taglish');
  await frame.getByRole('heading',{name:t('Long trails, cold lakes, warm beds.','taglish'),exact:true}).waitFor();
  assert.equal(await frame.locator('body').getAttribute('data-preserved'),'yes');
  await frame.getByRole('button',{name:t('Winter','taglish'),exact:true}).click();
  await page.waitForFunction(()=>new URL(location.href).searchParams.get('season')==='winter');
  await page.getByLabel('Preview page').selectOption('/activities');
  await frame.getByRole('heading',{name:t('Activities','taglish'),exact:true,level:1}).waitFor();
  assert.equal(await frame.getByRole('combobox',{name:t('Season','taglish'),exact:true}).inputValue(),'winter');
  await page.reload({waitUntil:'domcontentloaded'});
  await frame.getByRole('heading',{name:t('Activities','taglish'),exact:true,level:1}).waitFor();
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
