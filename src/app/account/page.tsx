'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Avatar,
  Badge,
  Button,
  SimpleGrid,
  Card,
  Divider,
  Alert,
  Loader,
  Box,
} from '@mantine/core';
import {
  IconUser,
  IconReceipt,
  IconShieldLock,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useTenantStore } from '@/store/tenantStore';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isAdmin, setDemoRole } = useAuth();
  const { tenant } = useTenantStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await orderService.getOrders(tenant.id, user?.uid);
        setOrders(data);
      } catch (err) {
        console.error('Error loading account orders', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [tenant.id, user?.uid]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'approved':
        return <Badge color="green" leftSection={<IconCheck size={12} />}>Pagado</Badge>;
      case 'pending':
        return <Badge color="yellow" leftSection={<IconClock size={12} />}>Pendiente</Badge>;
      case 'rejected':
        return <Badge color="red" leftSection={<IconX size={12} />}>Rechazado</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Button
          component={Link}
          href="/"
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
        >
          Volver a la tienda
        </Button>

        {isAdmin && (
          <Button
            component={Link}
            href="/admin"
            variant="light"
            color="violet"
            leftSection={<IconShieldLock size={16} />}
          >
            Ir a Panel Admin
          </Button>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {/* Left Column: User Profile Card */}
        <Paper withBorder radius="lg" p="lg">
          <Stack align="center" gap="sm">
            <Avatar size={80} radius="xl" color="violet">
              {user?.displayName?.slice(0, 2).toUpperCase() || 'U'}
            </Avatar>

            <Box ta="center">
              <Title order={3}>{user?.displayName || 'Usuario Invitado'}</Title>
              <Text c="dimmed" size="sm">{user?.email || 'Sin correo asociado'}</Text>
            </Box>

            <Badge color={isAdmin ? 'violet' : 'blue'} size="md" variant="filled">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </Badge>

            <Divider my="sm" style={{ width: '100%' }} />

            <Button
              variant="default"
              size="xs"
              fullWidth
              onClick={() => setDemoRole(isAdmin ? 'customer' : 'admin')}
            >
              Cambiar rol a {isAdmin ? 'Cliente' : 'Admin'}
            </Button>
          </Stack>
        </Paper>

        {/* Right Columns: Purchases and Orders History */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Paper withBorder radius="lg" p="lg">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconReceipt size={22} color="#7954c4" />
                <Title order={3}>Historial de Pedidos</Title>
              </Group>
              <Badge color="violet" variant="light">{orders.length} pedidos</Badge>
            </Group>

            {loading ? (
              <Group justify="center" py="xl">
                <Loader color="violet" size="sm" />
              </Group>
            ) : orders.length === 0 ? (
              <Alert color="gray" radius="md" title="Sin pedidos aún">
                No has realizado compras en esta tienda todavía.
              </Alert>
            ) : (
              <Stack gap="md">
                {orders.map((order) => (
                  <Card key={order.id} withBorder radius="md" p="md">
                    <Group justify="space-between" mb="xs">
                      <Box>
                        <Text fw={700} size="sm">Pedido #{order.id}</Text>
                        <Text size="xs" c="dimmed">
                          {new Date(order.createdAt).toLocaleString('es-AR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </Text>
                      </Box>
                      {getStatusBadge(order.status)}
                    </Group>

                    <Divider my="xs" />

                    <Stack gap={6}>
                      {order.items.map((item, idx) => (
                        <Group key={idx} justify="space-between">
                          <Text size="sm">
                            {item.quantity}x {item.title}
                          </Text>
                          <Text size="sm" fw={600}>
                            $ {(item.price * item.quantity).toLocaleString('es-AR')}
                          </Text>
                        </Group>
                      ))}
                    </Stack>

                    <Divider my="xs" />

                    <Group justify="space-between">
                      <Text fw={700} size="sm">Total Pagado</Text>
                      <Text fw={800} size="md" c="violet">
                        $ {order.totalAmount.toLocaleString('es-AR')} {order.currency}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </SimpleGrid>
    </Container>
  );
}
