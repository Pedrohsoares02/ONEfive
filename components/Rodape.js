import { WHATSAPP } from '@/app/constants';

const alvo = (url) => (/^https?:\/\//i.test(url) ? { target: '_blank', rel: 'noopener' } : {});

export default function Rodape({
  nota = 'ONEfive · Inovação pública',
  contato = '+55 48 9953-3203',
  contatoUrl = WHATSAPP,
}) {
  return (
    <footer className="of-rodape of-mono">
      <span className="of-rodape__fio" aria-hidden="true" />
      <span>{nota}</span>
      <a href={contatoUrl} {...alvo(contatoUrl)}>{contato}</a>
    </footer>
  );
}
