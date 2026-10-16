'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Group,
  Text,
  ActionIcon,
  Button,
  Indicator,
  Box,
  Image,
  useMantineColorScheme,
  Menu,
  Avatar,
  Badge,
  Tooltip,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconSun,
  IconMoon,
  IconUser,
  IconBuildingStore,
  IconLogout,
  IconShieldLock,
  IconReceipt,
} from '@tabler/icons-react';
import { useCartStore } from '@/store/cartStore';
import { useTenantStore } from '@/store/tenantStore';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const { tenant, loadTenant } = useTenantStore();
  const { user, isAdmin, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (tenant?.id) {
      loadTenant(tenant.id);
    }
  }, []);

  const totalItems = mounted
    ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0;

  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        backgroundColor: colorScheme === 'dark' ? 'rgba(26, 27, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderBottom: `1px solid ${colorScheme === 'dark' ? '#2C2E33' : '#E9ECEF'}`,
        boxShadow: colorScheme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      <Container size="xl" py={{ base: '0.85rem', sm: '1.15rem' }}>
        <Group justify="space-between" align="center">
          {/* Tenant Logo and Title (Rounded Logo & Removed Pill) */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="sm" align="center">
              {tenant.logoUrl ? (
                <Image
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  w={46}
                  h={46}
                  radius="50%"
                  fit="cover"
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--mantine-color-violet-6)',
                  }}
                  fallbackSrc="https://placehold.co/100x100?text=Logo"
                />
              ) : (
                <ActionIcon variant="light" size={46} radius="xl" color="violet">
                  <IconBuildingStore size={24} />
                </ActionIcon>
              )}
              <Box>
                <Text fw={800} size="1.25rem" lh={1.15} style={{ letterSpacing: '-0.4px' }}>
                  {tenant.name}
                </Text>
                <Text size="xs" c="dimmed">
                  Tienda Oficial
                </Text>
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

            {/* User Account / Auth Button */}
            {user ? (
              <Menu shadow="md" width={220} radius="md" position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="subtle"
                    color="gray"
                    radius="xl"
                    px="xs"
                    leftSection={
                      <Avatar
                        src={user.photoURL}
                        alt={user.displayName || 'Usuario'}
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

                  {isAdmin && (
                    <Menu.Item
                      component={Link}
                      href="/admin"
                      leftSection={<IconShieldLock size={16} />}
                    >
                      Panel Administrador
                    </Menu.Item>
                  )}

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

      {/* Authentication Modal */}
      <AuthModal opened={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Box>
  );
}
