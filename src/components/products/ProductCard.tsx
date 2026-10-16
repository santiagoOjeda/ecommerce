'use client';

import React from 'react';
import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Box,
  rem,
} from '@mantine/core';
import { IconShoppingCartPlus, IconEye } from '@tabler/icons-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { notifications } from '@mantine/notifications';

interface ProductCardProps {
  product: Product;
  currency: string;
  onOpenDetail: (product: Product) => void;
}

export function ProductCard({ product, currency, onOpenDetail }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = addItem(product, 1);
    if (success) {
      notifications.show({
        title: '¡Producto añadido!',
        message: `${product.title} se añadió al carrito.`,
        color: 'violet',
        autoClose: 2500,
      });
    } else {
      notifications.show({
        title: 'Stock máximo alcanzado',
        message: `No hay más de ${product.stock} unidades disponibles.`,
        color: 'orange',
      });
    }
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="lg"
      withBorder
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => onOpenDetail(product)}
    >
      <Card.Section style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={product.images[0]}
          height={200}
          alt={product.title}
          fallbackSrc="https://placehold.co/600x400?text=Producto"
          style={{
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Category Badge */}
        <Badge
          color="dark"
          variant="filled"
          size="sm"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          {product.category}
        </Badge>

        {/* Stock Status Badge */}
        <Box style={{ position: 'absolute', top: 10, right: 10 }}>
          {isOutOfStock ? (
            <Badge color="red" variant="filled" size="sm">
              Agotado
            </Badge>
          ) : isLowStock ? (
            <Badge color="orange" variant="filled" size="sm">
              Últimas {product.stock}
            </Badge>
          ) : (
            <Badge color="teal" variant="light" size="sm">
              Stock: {product.stock}
            </Badge>
          )}
        </Box>
      </Card.Section>

      <Stack justify="space-between" mt="md" gap="xs" style={{ flex: 1 }}>
        <Box>
          <Text fw={700} size="md" lineClamp={2} lh={1.3} mb={4}>
            {product.title}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {product.description}
          </Text>
        </Box>

        <Box pt="xs">
          <Group justify="space-between" align="baseline" mb="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Precio
            </Text>
            <Text fw={800} size="xl" c="violet">
              $ {product.price.toLocaleString('es-AR')}{' '}
              <Text span size="xs" fw={500} c="dimmed">
                {currency}
              </Text>
            </Text>
          </Group>

          <Group grow gap="xs">
            <Button
              variant="light"
              color="violet"
              size="sm"
              radius="md"
              leftSection={<IconShoppingCartPlus size={16} />}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Sin Stock' : 'Agregar'}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
              leftSection={<IconEye size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
            >
              Detalles
            </Button>
          </Group>
        </Box>
      </Stack>
    </Card>
  );
}
