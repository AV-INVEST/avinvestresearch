import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEntitlements, type EntitlementsState, DEFAULT_ENTITLEMENT_STATE } from '@/lib/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user) {
      return NextResponse.json(DEFAULT_ENTITLEMENT_STATE as EntitlementsState, { status: 200 });
    }
    const entitlements = await getEntitlements(session.user.id, session.user.email).catch(
      () => DEFAULT_ENTITLEMENT_STATE,
    );
    return NextResponse.json(entitlements as EntitlementsState, { status: 200 });
  } catch (err) {
    console.error('[api:entitlements:me] Failed', err instanceof Error ? err.message : String(err));
    return NextResponse.json(DEFAULT_ENTITLEMENT_STATE as EntitlementsState, { status: 200 });
  }
}
