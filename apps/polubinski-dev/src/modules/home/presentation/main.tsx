import './index.css';
import { Provider } from './context';
import { HeroSection } from './hero-section';
import { CategoriesSection } from './categories-section';
import { AboutSection } from './about-section';
import { ArticlesSection } from './articles-section';
import { LearningProcessSection } from './learning-process-section';
import { PlansSection } from './plans-section';
import { TestimonialsSection } from './testimonials-section';
import { MeetingSection } from './meeting-section';
import { MaterialsSection } from './materials-section';
import { MaterialsQualitySection } from './materials-quality-section';
import { FaqSection } from './faq-section';
import { Footer } from './footer';
import { SeniorProgramBanner } from './senior-program-banner';
import { LayoutNavigation } from './layout-navigation';
import type { Article, ScoreStats, Testimonial } from '../domain/models';

type MainProps = {
  testimonials: Testimonial[];
  articles: Article[];
  scoreStats: ScoreStats | null;
};

const Main = ({ testimonials, articles, scoreStats }: MainProps) => (
  <Provider value={{ testimonials, articles, scoreStats }}>
    <SeniorProgramBanner />
    <LayoutNavigation />
    <main>
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <ArticlesSection />
      <LearningProcessSection />
      <PlansSection />
      <TestimonialsSection />
      <MeetingSection />
      <MaterialsSection />
      <MaterialsQualitySection />
      <FaqSection />
      <Footer />
    </main>
  </Provider>
);

export { Main };
export type { MainProps };
