import { SiteHeader } from "@/components/store/site-header";
import { HomeHeroScene } from "@/components/store/home-hero-scene";

/**
 * Full-viewport pastoral hero. Header sits on the photograph;
 * after scroll it becomes a floating glass bar aligned to the canvas gutter.
 */
export function HomeHero() {
  return (
    <>
      <SiteHeader variant="overlay" pinOnScroll />
      <HomeHeroScene />
    </>
  );
}
