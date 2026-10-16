'use client';

import React, { useState } from 'react';
import {
  Modal,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  ActionIcon,
  Box,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import {
  IconShoppingCartPlus,
  IconPlus,
  IconMinus,
  IconTruckDelivery,
  IconShieldCheck,
  IconRotateClockwise2,
} from '@tabler/icons-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { notifications } from '@mantine/notifications';

interface ProductDetailModalProps {
  product: Product | null;
  currency: string;
  opened: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  currency,
  opened,
  onClose,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  if (!product) return null;

  const currentImage = selectedImage || product.images[0];
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    const success = addItem(product, quantity);
    if (success) {
      notifications.show({
        title: '¡Añadido al carrito!',
        message: `${quantity}x ${product.title} agregado al carrito.`,
        color: 'violet',
      });
      onClose();
      openCart();
    } else {
      notifications.show({
        title: 'Límite de stock',
        message: `No puedes agregar más unidades de las disponibles (${product.stock}).`,
        color: 'orange',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setSelectedImage('');
        setQuantity(1);
        onClose();
      }}
      size="lg"
      radius="lg"
      padding="lg"
      centered
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {/* Left: Product Images Gallery */}
        <Stack gap="sm">
          <Image
            src={currentImage}
            alt={product.title}
            radius="md"
            height={260}
            fit="cover"
            fallbackSrc="https://placehold.co/600x400?text=Foto"
          />

          {product.images.length > 1 && (
            <Group gap="xs">
              {product.images.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: currentImage === img ? '2px solid #7954c4' : '2px solid transparent',
                  }}
                >
                  <Image src={img} w={56} h={56} fit="cover" alt="thumbnail" />
                </Box>
              ))}
            </Group>
          )}

          {/* Value props */}
          <Stack gap={8} mt="xs">
            <Group gap="xs" c="dimmed">
              <IconTruckDelivery size={18} color="#7954c4" />
              <Text size="xs">Envío a todo el país</Text>
            </Group>
            <Group gap="xs" c="dimmed">
              <IconShieldCheck size={18} color="#22c55e" />
              <Text size="xs">Garantía oficial y compra protegida</Text>
            </Group>
          </Stack>
        </Stack>

        {/* Right: Details & Purchase actions */}
        <Stack justify="space-between" gap="md">
          <Box>
            <Group justify="space-between" align="center" mb={6}>
              <Badge color="violet" variant="light" size="sm">
                {product.category}
              </Badge>
              {isOutOfStock ? (
                <Badge color="red">Sin Stock</Badge>
              ) : (
                <Badge color="teal" variant="outline">
                  {product.stock} unidades disponibles
                </Badge>
              )}
            </Group>

            <Text fw={800} size="xl" lh={1.2} mb="xs">
              {product.title}
            </Text>

            <Text fw={800} size="2rem" c="violet" mb="sm">
              $ {product.price.toLocaleString('es-AR')}{' '}
              <Text span size="sm" fw={600} c="dimmed">
                {currency}
              </Text>
            </Text>

            <Divider my="sm" />

            <Text size="sm" c="dimmed" lh={1.6}>
              {product.description}
            </Text>
          </Box>

          {/* Quantity Selector & Add Button */}
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb={6}>
              CANTIDAD
            </Text>
            <Group gap="sm" mb="md">
              <Group gap={4}>
                <ActionIcon
                  size="md"
                  variant="default"
                  radius="md"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <Text fw={700} px="md">
                  {quantity}
                </Text>
                <ActionIcon
                  size="md"
                  variant="default"
                  radius="md"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>

              <Text size="xs" c="dimmed">
                Máx: {product.stock}
              </Text>
            </Group>

            <Button
              fullWidth
              size="md"
              radius="md"
              color="violet"
              disabled={isOutOfStock}
              leftSection={<IconShoppingCartPlus size={20} />}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Producto Agotado' : 'Añadir al Carrito'}
            </Button>
          </Box>
        </Stack>
      </SimpleGrid>
    </Modal>
  );
}
