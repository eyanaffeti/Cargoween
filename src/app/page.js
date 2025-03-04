import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
import TransitairesSection from '../components/TransitairesSection';
import Navbar from '../components/Navbar';
import CompagniesAériennes from '@/components/CompagniesAériennes';
import Temoignages from '@/components/Temoignages';

export default function Home() {
  return (
    <>
          <Navbar />

      <Header />
      <AboutSection />
      <TransitairesSection />
      <CompagniesAériennes/>
      <Temoignages/>

      <Footer />
    </>
  );
}
