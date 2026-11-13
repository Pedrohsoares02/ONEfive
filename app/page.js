import Topo from '@/components/Topo';
import Hero from '@/components/Hero';
import Frentes from '@/components/Frentes';
import Programa from '@/components/Programa';
import Legado from '@/components/Legado';
import Final from '@/components/Final';
import Modal from '@/components/Modal';
import Rodape from '@/components/Rodape';

export default function Home() {
  return (
    <>
      <Topo />
      <main>
        <Hero />
        <Frentes />
        <Programa />
        <Legado />
        <Final />
      </main>
      <Rodape />
      <Modal />
    </>
  );
}
