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
} from '@tabler/icons-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { HeroSlider } from '@/components/home/HeroSlider';
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
      {/* 100% Full-Width Animated Hero Slider */}
      <Box w="100%">
        <HeroSlider
          customBannerUrl={tenant.bannerUrl}
          tenantName={tenant.name}
          tenantDescription={tenant.description}
        />
      </Box>

      {/* Catalog & Filters */}
      <Container size="xl" pt="2rem" id="catalogo">
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
