'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Badge,
  Group,
  Divider,
  ActionIcon,
  Loader,
  Box,
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconX,
  IconShoppingBag,
  IconArrowRight,
} from '@tabler/icons-react';
import { useTenantStore } from '@/store/tenantStore';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const { tenant } = useTenantStore();
  const { user } = useAuth();
  const { clearCart } = useCartStore();

  const status = searchParams.get('status') || 'approved';
  const paramOrderId = searchParams.get('orderId');
  const [orderId] = useState(() => paramOrderId || `ord-${Math.random().toString(36).substring(2, 9)}`);
  const isSimulated = searchParams.get('simulated') === 'true';

  const [, setSaved] = useState(false);

  useEffect(() => {
    // Automatically reset/clear shopping cart on successful checkout
    if (status === 'approved') {
      clearCart();
    }

    // Save order in history
    async function recordOrder() {
      try {
        await orderService.createOrder({
          tenantId: tenant.id,
          userId: user?.uid,
          customerEmail: user?.email || 'cliente@ejemplo.com',
          customerName: user?.displayName || 'Cliente',
          items: [
            {
              productId: 'item-checkout',
              title: 'Compra en tienda',
              price: 185000,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            },
          ],
          totalAmount: 185000,
          currency: tenant.currency,
          status: status as any,
          mpPaymentId: `mp-pay-${Date.now()}`,
        });
        setSaved(true);
      } catch (err) {
        console.error('Error recording order result', err);
      }
    }
    recordOrder();
  }, [orderId, status, tenant.id, tenant.currency, user]);

  const isApproved = status === 'approved';
  const isPending = status === 'pending';

  return (
    <Container size="sm" py="3rem">
      <Paper withBorder radius="xl" p="2rem" ta="center">
        <Stack align="center" gap="md">
          {/* Status Icon */}
          <ActionIcon
            size={80}
            radius="100%"
            color={isApproved ? 'teal' : isPending ? 'yellow' : 'red'}
            variant="light"
          >
            {isApproved ? (
              <IconCheck size={44} />
            ) : isPending ? (
              <IconClock size={44} />
            ) : (
              <IconX size={44} />
            )}
          </ActionIcon>

          <Box>
            <Title order={2}>
              {isApproved
                ? '¡Pago Aprobado con Éxito!'
                : isPending
                ? 'Tu Pago está Pendiente de Acreditación'
                : 'No se pudo procesar el pago'}
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              {isApproved
                ? 'Hemos recibido tu orden y ya está siendo procesada para su despacho.'
                : isPending
                ? 'Mercado Pago está validando la transacción. Te avisaremos en cuanto se confirme.'
                : 'Hubo un inconveniente con el medio de pago seleccionado.'}
            </Text>
          </Box>

          {isSimulated && (
            <Badge color="blue" variant="light" size="md">
              Demostración de flujo Mercado Pago (Sandbox)
            </Badge>
          )}

          <Divider my="sm" style={{ width: '100%' }} />

          <Group justify="space-between" style={{ width: '100%' }}>
            <Text c="dimmed" size="sm">Código de Referencia:</Text>
            <Text fw={700} size="sm">#{orderId}</Text>
          </Group>

          <Group justify="space-between" style={{ width: '100%' }}>
            <Text c="dimmed" size="sm">Tienda:</Text>
            <Text fw={600} size="sm">{tenant.name}</Text>
          </Group>

          <Group justify="space-between" style={{ width: '100%' }}>
            <Text c="dimmed" size="sm">Estado Mercado Pago:</Text>
            <Badge color={isApproved ? 'green' : isPending ? 'yellow' : 'red'}>
              {status.toUpperCase()}
            </Badge>
          </Group>

          <Divider my="sm" style={{ width: '100%' }} />

          <Stack gap="xs" style={{ width: '100%' }}>
            <Button
              component={Link}
              href="/account"
              variant="filled"
              color="violet"
              size="md"
              radius="md"
              rightSection={<IconArrowRight size={18} />}
            >
              Ver mis Compras y Pedidos
            </Button>

            <Button
              component={Link}
              href="/"
              variant="subtle"
              color="gray"
              leftSection={<IconShoppingBag size={18} />}
            >
              Seguir Comprando
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense
      fallback={
        <Container size="sm" py="3rem">
          <Group justify="center">
            <Loader color="violet" />
          </Group>
        </Container>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
