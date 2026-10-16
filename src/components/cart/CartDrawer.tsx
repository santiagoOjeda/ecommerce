'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Button,
  Image,
  ActionIcon,
  Badge,
  Divider,
  Box,
  ScrollArea,
  Title,
  Alert,
} from '@mantine/core';
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconShoppingCartOff,
  IconCreditCard,
  IconAlertCircle,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { useAuth } from '@/context/AuthContext';
import { notifications } from '@mantine/notifications';

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, getTotalPrice, clearCart } =
    useCartStore();
  const { tenant } = useTenantStore();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setErrorMsg(null);
    setCheckingOut(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          customerEmail: user?.email || 'cliente.anonimo@ejemplo.com',
          customerName: user?.displayName || 'Cliente Tienda',
          items: items.map((i) => ({
            id: i.product.id,
            title: i.product.title,
            price: i.product.price,
            quantity: i.quantity,
            image: i.product.images[0] || '',
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.initPoint) {
        throw new Error(data.error || 'No se pudo generar la preferencia de pago');
      }

      notifications.show({
        title: 'Redireccionando a Mercado Pago',
        message: 'Serás transferido de forma segura para completar tu pago...',
        color: 'blue',
      });

      // Clear cart and redirect
      clearCart();
      closeCart();

      // Navigate to Mercado Pago Checkout
      window.location.href = data.initPoint;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err?.message || 'Ocurrió un error al iniciar el pago con Mercado Pago.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Drawer
      opened={isCartOpen}
      onClose={closeCart}
      title={
        <Group gap="xs">
          <Title order={4}>Tu Carrito</Title>
          <Badge color="violet" variant="light" size="sm">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </Badge>
        </Group>
      }
      position="right"
      size="md"
      padding="lg"
      styles={{
        content: { display: 'flex', flexDirection: 'column' },
        body: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 0 },
      }}
    >
      {items.length === 0 ? (
        <Stack align="center" justify="center" style={{ flex: 1 }} gap="md">
          <ActionIcon size={80} radius="xl" variant="light" color="gray">
            <IconShoppingCartOff size={40} />
          </ActionIcon>
          <Text fw={600} size="lg">Tu carrito está vacío</Text>
          <Text c="dimmed" size="sm" ta="center" px="md">
            Explora el catálogo y añade tus productos preferidos.
          </Text>
          <Button variant="light" color="violet" onClick={closeCart} radius="md">
            Ver Productos
          </Button>
        </Stack>
      ) : (
        <Stack justify="space-between" style={{ flex: 1 }} gap="md">
          {errorMsg && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
              {errorMsg}
            </Alert>
          )}

          {/* List of cart items */}
          <ScrollArea style={{ flex: 1 }} offsetScrollbars>
            <Stack gap="md" pr="xs">
              {items.map(({ product, quantity }) => (
                <Box
                  key={product.id}
                  p="sm"
                  style={{
                    borderRadius: 12,
                    border: '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group align="flex-start" wrap="nowrap" gap="sm">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        w={64}
                        h={64}
                        radius="md"
                        fit="cover"
                        fallbackSrc="https://placehold.co/100x100?text=Foto"
                      />
                      <Box>
                        <Text fw={600} size="sm" lineClamp={1}>
                          {product.title}
                        </Text>
                        <Text size="xs" c="dimmed" mb={4}>
                          {product.category}
                        </Text>
                        <Text fw={700} size="sm" c="violet">
                          $ {product.price.toLocaleString('es-AR')} {tenant.currency}
                        </Text>
                      </Box>
                    </Group>

                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => removeItem(product.id)}
                      aria-label="Eliminar producto"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  {/* Quantity Stepper & Stock reminder */}
                  <Group justify="space-between" mt="sm">
                    <Group gap={6}>
                      <ActionIcon
                        size="sm"
                        variant="default"
                        radius="sm"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <IconMinus size={12} />
                      </ActionIcon>
                      <Text fw={600} size="sm" px={8}>
                        {quantity}
                      </Text>
                      <ActionIcon
                        size="sm"
                        variant="default"
                        radius="sm"
                        disabled={quantity >= product.stock}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                      >
                        <IconPlus size={12} />
                      </ActionIcon>
                    </Group>

                    <Text size="xs" c={quantity >= product.stock ? 'red' : 'dimmed'}>
                      {quantity >= product.stock
                        ? `Límite stock (${product.stock})`
                        : `Stock disp: ${product.stock}`}
                    </Text>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>

          {/* Footer Checkout Summary */}
          <Box
            pt="md"
            pb="lg"
            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
          >
            <Group justify="space-between" mb="xs">
              <Text c="dimmed" size="sm">Subtotal</Text>
              <Text fw={700} size="lg">
                $ {totalPrice.toLocaleString('es-AR')} {tenant.currency}
              </Text>
            </Group>

            <Group gap={6} mb="md" c="dimmed">
              <IconShieldCheck size={16} color="green" />
              <Text size="xs">Pago 100% protegido por Mercado Pago</Text>
            </Group>

            <Button
              fullWidth
              size="md"
              radius="md"
              color="blue"
              leftSection={<IconCreditCard size={20} />}
              loading={checkingOut}
              onClick={handleCheckout}
              styles={{
                root: {
                  backgroundColor: '#009ee3', // Mercado Pago Blue brand color
                  transition: 'transform 0.15s ease',
                  '&:hover': { backgroundColor: '#0083bd' },
                },
              }}
            >
              Pagar con Mercado Pago
            </Button>
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
