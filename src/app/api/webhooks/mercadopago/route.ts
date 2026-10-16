import { NextRequest, NextResponse } from 'next/server';
import { paymentClient, isMercadoPagoConfigured } from '@/lib/mercadopago/config';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body might be empty in some MP webhook pings
    }

    const action = body.action || type;
    const paymentId = body.data?.id || dataId;

    if (paymentId && isMercadoPagoConfigured) {
      try {
        const payment = await paymentClient.get({ id: paymentId });
        const externalReference = payment.external_reference;
        const status = payment.status; // 'approved', 'pending', 'rejected', etc.

        console.log(`[Mercado Pago Webhook] Order ${externalReference} status: ${status}`);

        // In a live production setting with Firebase Admin, you update the order document in Firestore:
        // await db.collection('tenants').doc(tenantId).collection('orders').doc(externalReference).update({ status });
      } catch (err) {
        console.error('Error fetching payment from Mercado Pago:', err);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
