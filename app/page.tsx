import { Hero }           from '@/components/Hero';
import { LeadForm }       from '@/components/LeadForm';
import { Moment }         from '@/components/Moment';
import { RootCause }      from '@/components/RootCause';
import { Why }            from '@/components/Why';
import { Ingredients }    from '@/components/Ingredients';
import { Ritual }         from '@/components/Ritual';
import { Testimonials }   from '@/components/Testimonials';
import { Results }        from '@/components/Results';
import { Trust }          from '@/components/Trust';
import { FAQ }            from '@/components/FAQ';
import { PricingSection } from '@/components/PricingSection';
import { OrderForm }      from '@/components/OrderForm';

export default function Home() {
  return (
    <>
      <Hero />
      <LeadForm />
      <Moment />
      <RootCause />
      <Why />
      <Ingredients />
      <Ritual />
      <Testimonials />
      <Results />
      <Trust />
      <FAQ />
      <PricingSection />
      <OrderForm />
    </>
  );
}
