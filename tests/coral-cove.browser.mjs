import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright-core";

const base = process.env.PREVIEW_BASE ?? "http://localhost:3100";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local server");

test("Coral Cove languages, mobile layouts, comparison, forms and preview state", {timeout:180_000}, async () => {
  const browser = await chromium.launch({channel:"chrome",headless:true});
  const errors=[];
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    page.setDefaultTimeout(12_000);
    page.on("pageerror",error=>errors.push(error.message));
    const routes=[
      ["","Coral Cove","Coral Cove"],
      ["/villas","Mga villa sa look","Villas sa cove"],
      ["/villas/overwater-villa","Villa sa Ibabaw ng Tubig","Overwater Villa"],
      ["/villas/garden-pool-villa","Villa na may Hardin at Palanguyan","Garden Pool Villa"],
      ["/villas/beachfront-bungalow","Bungalo sa Dalampasigan","Beachfront Bungalow"],
      ["/villas/lagoon-family-villa","Villa para sa Pamilya sa Lawa","Lagoon Family Villa"],
      ["/experiences","Mga araw sa dagat","Mga araw by the water"],
      ["/offers","Mga alok at pakete","Offers at packages"],
      ["/gallery","Mga larawan","Gallery"],
      ["/contact","Makipag-usap sa amin","Usap tayo"],
      ["/credits","Pagkilala sa mga litratista","Photo credits"],
      ["/book","Planuhin ang bakasyon sa isla","Planuhin ang island stay mo"],
    ];
    for(const [index,language] of ["tl","taglish"].entries())for(const [path,...headings] of routes){
      await page.goto(`${base}/demo/coral-cove${path}?lang=${language}`,{waitUntil:"domcontentloaded"});
      await page.getByRole("heading",{level:1,name:headings[index],exact:true}).waitFor();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${language} ${path} overflows`);
      const links=await page.locator('[data-template="coral-cove"] a[href^="/demo/coral-cove"]').evaluateAll(nodes=>nodes.map(n=>n.href));
      assert.ok(links.every(link=>new URL(link).searchParams.get("lang")===language),`${path} loses language`);
    }
    await page.setViewportSize({width:360,height:800});
    await page.goto(`${base}/demo/coral-cove/villas?lang=tl`,{waitUntil:"domcontentloaded"});
    const compare=page.locator("#compare");
    await compare.getByRole("combobox",{name:"Mga panauhin",exact:true}).selectOption("4");
    assert.equal(await compare.locator("article").count(),1);
    await compare.getByText("Pinagsasaluhang palanguyan",{exact:true}).last().waitFor();
    await compare.getByRole("combobox",{name:"Uri ng palanguyan",exact:true}).selectOption("private");
    await compare.getByText("Walang tugmang villa. Subukan ang ibang palanguyan o bawasan ang bisita.").waitFor();
    await compare.getByRole("button",{name:"Ibalik ang mga pagpipilian"}).click();
    await compare.getByLabel("Pagdating",{exact:true}).fill("2027-05-03");
    await compare.getByLabel("Pag-alis",{exact:true}).fill("2027-05-04");
    const plan=compare.getByRole("link",{name:"Planuhin ang pamamalagi"}).first();
    const target=new URL(await plan.getAttribute("href"),base);
    assert.equal(target.searchParams.get("checkin"),"2027-05-03");
    assert.equal(target.searchParams.get("lang"),"tl");
    await plan.click();
    await page.locator('label').filter({has:page.locator('input[name="villa"]:not(:disabled)')}).first().click();
    await page.getByRole("button",{name:"Magpatuloy",exact:true}).click();
    await page.locator('[name="name"]').fill("Sample Guest");
    await page.getByLabel("Wika",{exact:true}).selectOption("taglish");
    assert.equal(await page.locator('[name="name"]').inputValue(),"Sample Guest");
    await page.locator('[name="email"]').first().fill("sample@example.com");
    await page.locator('[name="phone"]').fill("09000000000");
    await page.getByRole("button",{name:"Review sample stay",exact:true}).click();
    await page.locator('form[aria-labelledby="step-review"]').getByRole("checkbox").check();
    await page.getByRole("button",{name:"Finish sample stay",exact:true}).click();
    await page.getByRole("heading",{name:"Ready na ang sample stay mo."}).waitFor();
    await page.getByText("Walang reservation, payment, o email na ginawa.",{exact:false}).first().waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"confirmation overflows");

    await page.goto(`${base}/demo/coral-cove/contact?lang=tl`,{waitUntil:"domcontentloaded"});
    const form=page.locator('form').first();
    await form.locator('[name="name"]').fill("Sample Guest");
    await form.locator('[name="email"]').fill("invalid");
    await form.locator('[name="message"]').fill("Sample only");
    await form.getByRole("button",{name:"Subukan ang mensahe"}).click();
    assert.equal(await form.locator('[name="email"]').evaluate(e=>e.validationMessage),"Pakilagay ang wastong impormasyon.");
    await form.locator('[name="email"]').fill("sample@example.com");
    await form.getByRole("button",{name:"Subukan ang mensahe"}).click();
    await page.getByRole("status").filter({hasText:"Tapos na ang halimbawang mensahe."}).waitFor();
    await page.locator('footer [name="email"]').fill("sample@example.com");
    await page.locator('footer').getByRole("button",{name:"Subukang magpatala"}).click();
    await page.getByText("Tapos na ang pagsubok. Walang itinalang tagatanggap ng balita.").waitFor();

    await page.goto(`${base}/demo/coral-cove/gallery?lang=tl`,{waitUntil:"domcontentloaded"});
    await page.locator('main button').first().click();
    await page.getByRole("dialog",{name:"Tagatingin ng larawan"}).waitFor();
    await page.getByRole("button",{name:"Susunod na larawan"}).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({state:"hidden"});

    await page.setViewportSize({width:1366,height:900});
    await page.goto(`${base}/preview/coral-cove?page=%2Fbook&lang=tl`,{waitUntil:"domcontentloaded"});
    const frame=page.frameLocator('iframe');
    await frame.getByRole("heading",{name:"Planuhin ang bakasyon sa isla"}).waitFor();
    await frame.locator('body').evaluate(body=>{body.dataset.preserved="yes";});
    await page.getByRole("button",{name:"mobile",exact:true}).click();
    await page.getByLabel("Preview language").selectOption("taglish");
    await frame.getByRole("heading",{name:"Planuhin ang island stay mo"}).waitFor();
    assert.equal(await frame.locator('body').getAttribute('data-preserved'),"yes");
    await frame.getByRole("link",{name:"coral cove",exact:true}).first().click();
    await page.waitForFunction(()=>new URL(location.href).searchParams.get("page")==="");
    await page.getByLabel("Preview page").selectOption("/book");
    await frame.getByRole("heading",{name:"Planuhin ang island stay mo"}).waitFor();
    await page.reload({waitUntil:"domcontentloaded"});
    await frame.getByRole("heading",{name:"Planuhin ang island stay mo"}).waitFor();
    assert.equal(await page.getByLabel("Preview language").inputValue(),"taglish");
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); }
});
