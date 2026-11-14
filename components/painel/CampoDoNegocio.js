'use client';

import CampoEditavel from '@/components/painel/CampoEditavel.js';
import { salvarCampoAcao } from '@/app/(painel)/painel/acoes.js';

/* Casca fina: a ficha é componente de servidor e não pode passar uma função
   para o cliente. Aqui o negócio e o campo viajam como texto, e a chamada
   da ação nasce já do lado do navegador. */
export default function CampoDoNegocio({ negocioId, campo, ...resto }) {
  return <CampoEditavel {...resto} aoGravar={(valor) => salvarCampoAcao(negocioId, campo, valor)} />;
}
