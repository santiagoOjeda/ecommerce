'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Group,
  TextInput,
  SegmentedControl,
  Select,
  Box,
  Paper,
  Button,
  Badge,
  Loader,
  Stack,
  Card,
  Image,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconShoppingCart,
  IconSparkles,
  IconShieldCheck,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { useTenantStore } from '@/store/tenantStore';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

export default function HomePage() {
  const { tenant } = useTenantStore();
  const { toggleCart, getTotalItems } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchCatalog() {
      setLoading(true);
      try {
        const data = await productService.getProducts(tenant.id);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching catalog', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [tenant.id]);

  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products
    .filter((prod) => {
      const matchesSearch =
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todos' || prod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return b.createdAt - a.createdAt;
    });

  return (
    <Box pb="4rem">
      {/* Hero Section */}
      <Box
        py={{ base: '2.5rem', md: '4rem' }}
        px="md"
        style={{
          background: 'linear-gradient(135deg, rgba(121, 84, 196, 0.08) 0%, rgba(93, 63, 153, 0.15) 100%)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
            <Box>
              <Badge
                size="md"
                variant="gradient"
                gradient={{ from: 'violet', to: 'indigo', deg: 90 }}
                mb="sm"
                leftSection={<IconSparkles size={14} />}
              >
                Tienda Oficial Verificada
              </Badge>
              <Title
                order={1}
                size="clamp(2rem, 5vw, 3rem)"
                lh={1.15}
                fw={800}
                style={{ letterSpacing: '-0.5px' }}
                mb="md"
              >
                {tenant.name}
              </Title>
              <Text size="lg" c="dimmed" mb="lg" lh={1.6}>
                {tenant.description || 'Descubre nuestra selección exclusiva de productos con stock inmediato y envíos a todo el país.'}
              </Text>

              <Group gap="md">
                <Group gap={6} c="dimmed">
                  <IconTruckDelivery size={18} color="#7954c4" />
                  <Text size="sm">Envíos rápidos</Text>
                </Group>
                <Group gap={6} c="dimmed">
                  <IconShieldCheck size={18} color="#22c55e" />
                  <Text size="sm">Mercado Pago Protegido</Text>
                </Group>
              </Group>
            </Box>

            {/* Banner card preview */}
            <Card
              radius="lg"
              p={0}
              withBorder
              visibleFrom="sm"
              style={{ overflow: 'hidden', maxHeight: 280 }}
            >
              <Image
                src={tenant.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'}
                alt="Banner"
                height={280}
                fit="cover"
              />
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Catalog & Filters */}
      <Container size="xl" pt="2rem">
        <Stack gap="lg">
          {/* Controls bar: Search, Sort and Category pills */}
          <Paper p="md" radius="lg" withBorder>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="sm">
              <TextInput
                placeholder="Buscar por título o descripción..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ gridColumn: 'span 2' }}
              />

              <Select
                placeholder="Ordenar por"
                value={sortBy}
                onChange={(val) => setSortBy(val || 'recent')}
                data={[
                  { value: 'recent', label: 'Más recientes' },
                  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
                  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
                ]}
              />
            </SimpleGrid>

            {/* Mobile-Friendly Category Pills */}
            <Box style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 4 }}>
              <Group gap="xs" wrap="nowrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="xs"
                    radius="xl"
                    variant={selectedCategory === cat ? 'filled' : 'light'}
                    color="violet"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </Group>
            </Box>
          </Paper>

          {/* Results Header */}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Mostrando <Text span fw={700} c="inherit">{filteredProducts.length}</Text> productos
            </Text>
          </Group>

          {/* Products Grid */}
          {loading ? (
            <Group justify="center" py="4rem">
              <Loader color="violet" size="lg" />
            </Group>
          ) : filteredProducts.length === 0 ? (
            <Paper p="3rem" radius="lg" withBorder ta="center">
              <Text fw={700} size="lg" mb={4}>
                No se encontraron productos
              </Text>
              <Text c="dimmed" size="sm" mb="md">
                Prueba buscando con otros términos o seleccionando otra categoría.
              </Text>
              <Button
                variant="light"
                color="violet"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
              >
                Restablecer filtros
              </Button>
            </Paper>
          ) : (
            <SimpleGrid
              cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3 }}
              spacing={{ base: 'md', sm: 'lg' }}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={tenant.currency}
                  onOpenDetail={(prod) => setDetailProduct(prod)}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      {/* Floating Mobile Cart Action Button */}
      {getTotalItems() > 0 && (
        <Box
          hiddenFrom="sm"
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 90,
          }}
        >
          <Button
            fullWidth
            size="lg"
            radius="xl"
            color="violet"
            leftSection={<IconShoppingCart size={22} />}
            onClick={toggleCart}
            style={{ boxShadow: '0 8px 24px rgba(121, 84, 196, 0.45)' }}
          >
            Ver Carrito ({getTotalItems()})
          </Button>
        </Box>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        currency={tenant.currency}
        opened={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
      />
    </Box>
  );
}
