import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoryTiles } from "@/components/sections/CategoryTiles";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { BentoBox } from "@/components/sections/BentoBox";
import { BrandMarquee } from "@/components/sections/BrandMarquee";
import { TrendingSection } from "@/components/sections/TrendingSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
// import { ReviewsSection } from "@/components/sections/ReviewsSection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <HeroSection />
        <CategoryTiles />
        <TrustStrip />
        <BentoBox />
        <BrandMarquee />
        <TrendingSection />
        <NewsletterSection />
        {/* Reviews hidden until we have genuine verified reviews:
        <ReviewsSection />
        */}
      </main>
      <SiteFooter />
    </>
  );
}