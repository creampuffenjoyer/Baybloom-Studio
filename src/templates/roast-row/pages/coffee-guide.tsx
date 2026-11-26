import Link from "next/link";
import { SitePhoto } from "../../_kit/hospitality-site";
import { brewRecipes } from "../experiences";
import photos from "../photos.json";
import { href } from "../site";
import { CoffeeFinder } from "./coffee-finder";

export function CoffeeGuidePage() {
  return (
    <div className="rr-editor">
      <header className="rr-editor-hero">
        <div><p className="rr-label">Good beans, good water</p><h1 className="rr-display">FIND YOUR<br />KIND OF COFFEE.</h1><p>Start with the flavors you like, then learn to make them at home.</p></div>
        <div className="rr-editor-image"><SitePhoto photo={photos.beans} sizes="(min-width: 850px) 50vw, 100vw" priority /></div>
      </header>
      <div className="rr-editor-grid">
        <CoffeeFinder />
        <section aria-labelledby="rr-brew-title" className="rr-brew-notes">
          <p className="rr-label">From the bar</p><h2 id="rr-brew-title">Brew it your way.</h2>
          <div>{brewRecipes.map((recipe, index) => <details key={recipe.method} open={index === 0}><summary>{recipe.method}</summary><p><strong>{recipe.ratio}</strong></p><p>{recipe.tip}</p></details>)}</div>
          <Link className="rr-text-link" href={href("/workshops")}>Practice with a barista <span aria-hidden="true">↗</span></Link>
        </section>
      </div>
    </div>
  );
}
