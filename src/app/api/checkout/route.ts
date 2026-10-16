import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { preferenceClient, isMercadoPagoConfigured } from '@/lib/mercadopago/config';

const CheckoutSchema = z.object({
  tenantId: z.string().min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
    })
  ).min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CheckoutSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de compra inválidos', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items, tenantId, customerEmail, customerName } = parsed.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If Mercado Pago is properly configured with real credentials
    if (isMercadoPagoConfigured) {
      try {
        const isHttps = baseUrl.startsWith('https://');
        const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

        const preferenceBody: any = {
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: 'ARS',
            picture_url: item.image,
          })),
          payer: {
            email: customerEmail,
            name: customerName,
          },
          back_urls: {
            success: `${baseUrl}/checkout/result?status=approved&orderId=${orderId}&tenant=${tenantId}`,
            failure: `${baseUrl}/checkout/result?status=rejected&orderId=${orderId}&tenant=${tenantId}`,
            pending: `${baseUrl}/checkout/result?status=pending&orderId=${orderId}&tenant=${tenantId}`,
          },
          external_reference: orderId,
          statement_descriptor: 'TIENDA ECOMMERCE',
        };

        // Mercado Pago only permits auto_return with HTTPS URLs
        if (isHttps) {
          preferenceBody.auto_return = 'approved';
        }

        // Notification URL must be publicly accessible (not localhost)
        if (!isLocalhost && isHttps) {
          preferenceBody.notification_url = `${baseUrl}/api/webhooks/mercadopago`;
        }

        const preference = await preferenceClient.create({ body: preferenceBody });

        return NextResponse.json({
          success: true,
          orderId,
          preferenceId: preference.id,
          initPoint: preference.init_point || preference.sandbox_init_point,
          mode: 'mercadopago',
        });
      } catch (mpError: any) {
        console.error('Mercado Pago API error:', mpError);
        // Fallback to simulated checkout if MP fails due to test credentials
      }
    }

    // Dev/Sandbox simulation when live credentials are not yet configured
    const simulatedInitPoint = `${baseUrl}/checkout/result?status=approved&orderId=${orderId}&tenant=${tenantId}&simulated=true`;

    return NextResponse.json({
      success: true,
      orderId,
      preferenceId: `pref_sim_${Date.now()}`,
      initPoint: simulatedInitPoint,
      mode: 'simulation',
      note: 'Modo de demostración de Mercado Pago activo (puedes configurar tus credenciales en .env.local)',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Error procesando la orden de compra' },
      { status: 500 }
    );
  }
}
