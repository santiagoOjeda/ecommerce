'use client';

import React, { useState } from 'react';
import {
  Group,
  Button,
  Text,
  Badge,
  ActionIcon,
  Avatar,
  Menu,
  Container,
  Box,
  rem,
  Tooltip,
  useMantineColorScheme,
  Image,
  Indicator,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconSun,
  IconMoon,
  IconUser,
  IconSettings,
  IconReceipt,
  IconLogout,
  IconShieldLock,
  IconBuildingStore,
} from '@tabler/icons-react';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { toggleCart, getTotalItems } = useCartStore();
  const { tenant } = useTenantStore();
  const { user, isAdmin, logout, setDemoRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const totalItems = getTotalItems();

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        backgroundColor: colorScheme === 'dark' ? 'rgba(26, 27, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        borderBottom: `1px solid ${colorScheme === 'dark' ? '#2C2E33' : '#E9ECEF'}`,
      }}
    >
      <Container size="xl" h={70}>
        <Group justify="space-between" h="100%">
          {/* Tenant Logo and Title */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="xs">
              {tenant.logoUrl ? (
                <Image
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  w={38}
                  h={38}
                  radius="md"
                  fit="cover"
                  fallbackSrc="https://placehold.co/100x100?text=Logo"
                />
              ) : (
                <ActionIcon variant="light" size="lg" radius="md" color="violet">
                  <IconBuildingStore size={22} />
                </ActionIcon>
              )}
              <Box>
                <Text fw={800} size="lg" lh={1.1} style={{ letterSpacing: '-0.5px' }}>
                  {tenant.name}
                </Text>
                <Group gap={4}>
                  <Badge size="xs" variant="outline" color="violet">
                    {tenant.slug}
                  </Badge>
                  <Text size="xs" c="dimmed" hiddenFrom="xs">
                    • E-Commerce
                  </Text>
                </Group>
              </Box>
            </Group>
          </Link>

          {/* Actions: Theme Toggle, Cart, User / Admin */}
          <Group gap="sm">
            {/* Color Scheme Toggle */}
            <Tooltip label={colorScheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => toggleColorScheme()}
                size="lg"
                radius="md"
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>

            {/* Cart Button with Indicator */}
            <Tooltip label="Carrito de compras">
              <Indicator
                label={totalItems}
                size={20}
                offset={4}
                position="top-end"
                color="violet"
                disabled={totalItems === 0}
                withBorder
                styles={{
                  indicator: {
                    fontWeight: 700,
                    fontSize: '11px',
                    boxShadow: '0 2px 6px rgba(121, 84, 196, 0.4)',
                    padding: '0 4px',
                  },
                }}
              >
                <ActionIcon
                  variant="light"
                  color="violet"
                  size="lg"
                  radius="md"
                  onClick={toggleCart}
                  aria-label="Carrito de compras"
                  style={{
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <IconShoppingCart size={22} />
                </ActionIcon>
              </Indicator>
            </Tooltip>

            {/* User Menu */}
            {user ? (
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="subtle"
                    radius="md"
                    px="xs"
                    leftSection={
                      <Avatar
                        src={user.photoURL}
                        size={28}
                        radius="xl"
                        color="violet"
                      >
                        {user.displayName?.slice(0, 2).toUpperCase() || 'U'}
                      </Avatar>
                    }
                  >
                    <Text size="sm" fw={600} visibleFrom="sm">
                      {user.displayName}
                    </Text>
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>
                    {user.email} {isAdmin && <Badge size="xs" color="violet" ml={4}>Admin</Badge>}
                  </Menu.Label>

                  <Menu.Item
                    component={Link}
                    href="/account"
                    leftSection={<IconReceipt size={16} />}
                  >
                    Mis Compras & Pedidos
                  </Menu.Item>

                  <Menu.Item
                    component={Link}
                    href="/admin"
                    leftSection={<IconShieldLock size={16} />}
                  >
                    Panel Administrador
                  </Menu.Item>

                  <Menu.Divider />

                  {/* Toggle demo role for instant testing */}
                  <Menu.Label>Modo de Prueba (Dev)</Menu.Label>
                  <Menu.Item
                    onClick={() => setDemoRole(isAdmin ? 'customer' : 'admin')}
                    leftSection={<IconSettings size={16} />}
                  >
                    Cambiar a {isAdmin ? 'Cliente' : 'Admin'}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={logout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                variant="gradient"
                gradient={{ from: 'violet', to: 'indigo', deg: 90 }}
                radius="md"
                size="sm"
                leftSection={<IconUser size={18} />}
                onClick={() => setAuthModalOpen(true)}
              >
                Ingresar
              </Button>
            )}
          </Group>
        </Group>
      </Container>

      <AuthModal opened={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Box>
  );
}
