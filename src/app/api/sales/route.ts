import { NextResponse } from 'next/server';
import { getSalesState } from '@/lib/sales/sales-store';

/**
 * Stato commerciale pubblico (ON/OFF + quantità) usato dal sito per aggiornare
 * badge e pulsanti senza deploy. Nessun dato sensibile: gli stessi valori sono
 * già mostrati sulle pagine. Nessuna cache per riflettere subito le modifiche admin.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await getSalesState();
  return NextResponse.json(state, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    },
  });
}
