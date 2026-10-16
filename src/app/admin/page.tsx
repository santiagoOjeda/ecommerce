'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Tabs,
  Paper,
  Group,
  Stack,
  Button,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Switch,
  Table,
  Badge,
  ActionIcon,
  Modal,
  Image,
  SimpleGrid,
  Card,
  Alert,
  Loader,
  ColorInput,
  Box,
  FileButton,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconPackage,
  IconReceipt,
  IconShieldLock,
  IconAlertCircle,
  IconArrowLeft,
  IconPhoto,
  IconCheck,
  IconUpload,
  IconLink,
  IconStar,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useTenantStore } from '@/store/tenantStore';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { storageService } from '@/services/storageService';
import { Product, Order } from '@/types';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

const SAMPLE_PRODUCT_IMAGES = [
  { label: 'Auriculares', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
  { label: 'Zapatillas', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mochila', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cámara', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80' },
];

export default function AdminPage() {
  const { user, isAdmin, setDemoRole } = useAuth();
  const { tenant, updateTenant } = useTenantStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Tenant Settings Form State
  const [tenantName, setTenantName] = useState(tenant.name);
  const [tenantLogo, setTenantLogo] = useState(tenant.logoUrl);
  const [tenantSlug, setTenantSlug] = useState(tenant.slug);
  const [tenantDesc, setTenantDesc] = useState(tenant.description || '');
  const [tenantEmail, setTenantEmail] = useState(tenant.contactEmail || '');
  const [tenantColor, setTenantColor] = useState(tenant.primaryColor || '#7954c4');
  const [savingTenant, setSavingTenant] = useState(false);

  useEffect(() => {
    setTenantName(tenant.name);
    setTenantLogo(tenant.logoUrl);
    setTenantSlug(tenant.slug);
    setTenantDesc(tenant.description || '');
    setTenantEmail(tenant.contactEmail || '');
    setTenantColor(tenant.primaryColor || '#7954c4');
  }, [tenant]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        productService.getAllProductsForAdmin(tenant.id),
        orderService.getOrders(tenant.id),
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant.id]);

  // Product Handlers
  const handleOpenCreate = () => {
    setEditingProduct({
      tenantId: tenant.id,
      title: '',
      description: '',
      price: 10000,
      category: 'General',
      stock: 10,
      isActive: true,
      images: [],
    });
    setImagesList([]);
    setImageUrlInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setImagesList(prod.images || []);
    setImageUrlInput('');
    setModalOpen(true);
  };

  const handleAddImageUrl = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!imageUrlInput.trim()) return;
    setImagesList((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await storageService.uploadProductImage(tenant.id, file);
      setImagesList((prev) => [...prev, result.url]);
      notifications.show({
        title: 'Foto añadida',
        message: result.isCloud
          ? 'La imagen se subió exitosamente a Firebase Storage.'
          : 'La imagen fue procesada y añadida al producto.',
        color: 'green',
      });
    } catch (err) {
      console.error('Error uploading product photo', err);
      notifications.show({
        title: 'Error al subir foto',
        message: 'No se pudo procesar la imagen seleccionada.',
        color: 'red',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImagesList((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleAddSampleImage = (url: string) => {
    setImagesList((prev) => [...prev, url]);
    notifications.show({
      title: 'Foto de muestra añadida',
      message: 'Se agregó la imagen al producto.',
      color: 'teal',
      autoClose: 2000,
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const result = await storageService.uploadTenantLogo(tenant.id, file);
      setTenantLogo(result.url);
      notifications.show({
        title: 'Logo actualizado',
        message: result.isCloud
          ? 'El logo se subió a Firebase Storage.'
          : 'El logo se procesó correctamente.',
        color: 'green',
      });
    } catch (err) {
      console.error('Error uploading logo', err);
      notifications.show({
        title: 'Error',
        message: 'No se pudo subir el logo.',
        color: 'red',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const saved = await productService.saveProduct(tenant.id, {
        ...editingProduct,
        images: imagesList.length ? imagesList : ['https://placehold.co/600x400?text=Producto'],
      });

      notifications.show({
        title: 'Producto guardado',
        message: `${saved.title} se guardó exitosamente.`,
        color: 'green',
      });

      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving product', err);
      notifications.show({
        title: 'Error',
        message: 'No se pudo guardar el producto.',
        color: 'red',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    try {
      await productService.deleteProduct(tenant.id, id);
      notifications.show({
        title: 'Producto eliminado',
        message: 'El producto fue removido.',
        color: 'gray',
      });
      loadData();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  // Tenant Save
  const handleSaveTenantSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTenant(true);
    try {
      await updateTenant({
        name: tenantName,
        logoUrl: tenantLogo,
        slug: tenantSlug,
        description: tenantDesc,
        contactEmail: tenantEmail,
        primaryColor: tenantColor,
      });

      notifications.show({
        title: 'Tienda actualizada',
        message: 'Los cambios de marca y logo fueron guardados con éxito.',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron actualizar los datos del tenant.',
        color: 'red',
      });
    } finally {
      setSavingTenant(false);
    }
  };

  if (!isAdmin) {
    return (
      <Container size="sm" py="xl">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Acceso Restringido"
          color="red"
          radius="lg"
        >
          <Text size="sm" mb="md">
            Esta sección es exclusiva para administradores de la tienda.
          </Text>
          <Group gap="sm">
            <Button
              variant="filled"
              color="violet"
              size="xs"
              onClick={() => setDemoRole('admin')}
            >
              Habilitar Modo Administrador (Dev)
            </Button>
            <Button component={Link} href="/" variant="subtle" size="xs">
              Volver a la tienda
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Top Header */}
      <Group justify="space-between" mb="lg">
        <Box>
          <Group gap="xs">
            <IconShieldLock size={28} color="#7954c4" />
            <Title order={2}>Panel de Administración</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Administra los productos, stocks, pedidos y marca de {tenant.name}
          </Text>
        </Box>

        <Button
          component={Link}
          href="/"
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
        >
          Ver Tienda Pública
        </Button>
      </Group>

      {/* Overview Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder radius="lg" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Total de Productos
          </Text>
          <Text fw={800} size="1.8rem" c="violet">
            {products.length}
          </Text>
        </Card>

        <Card withBorder radius="lg" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Alertas de Stock
          </Text>
          <Text fw={800} size="1.8rem" c={products.filter((p) => p.stock <= 3).length > 0 ? 'orange' : 'teal'}>
            {products.filter((p) => p.stock <= 3).length} bajos o agotados
          </Text>
        </Card>

        <Card withBorder radius="lg" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Pedidos Registrados
          </Text>
          <Text fw={800} size="1.8rem" c="blue">
            {orders.length} pedidos
          </Text>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs defaultValue="products" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="products" leftSection={<IconPackage size={16} />}>
            Catálogo & Stock ({products.length})
          </Tabs.Tab>
          <Tabs.Tab value="tenant" leftSection={<IconBuildingStore size={16} />}>
            Marca & Logo (Tenant)
          </Tabs.Tab>
          <Tabs.Tab value="orders" leftSection={<IconReceipt size={16} />}>
            Pedidos ({orders.length})
          </Tabs.Tab>
        </Tabs.List>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        <Tabs.Panel value="products">
          <Paper withBorder radius="lg" p="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Listado de Productos</Title>
              <Button
                variant="filled"
                color="violet"
                leftSection={<IconPlus size={16} />}
                onClick={handleOpenCreate}
              >
                Nuevo Producto
              </Button>
            </Group>

            {loading ? (
              <Group justify="center" py="xl">
                <Loader color="violet" />
              </Group>
            ) : products.length === 0 ? (
              <Alert color="gray" title="Catálogo vacío">
                No hay productos cargados aún. Haz clic en &quot;Nuevo Producto&quot; para añadir uno.
              </Alert>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Foto</Table.Th>
                      <Table.Th>Título</Table.Th>
                      <Table.Th>Categoría</Table.Th>
                      <Table.Th>Precio</Table.Th>
                      <Table.Th>Stock</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th ta="right">Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {products.map((prod) => (
                      <Table.Tr key={prod.id}>
                        <Table.Td>
                          <Image
                            src={prod.images[0]}
                            w={44}
                            h={44}
                            radius="md"
                            fit="cover"
                            fallbackSrc="https://placehold.co/100x100?text=Foto"
                          />
                        </Table.Td>
                        <Table.Td fw={600}>{prod.title}</Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="gray" size="sm">
                            {prod.category}
                          </Badge>
                        </Table.Td>
                        <Table.Td fw={700}>
                          $ {prod.price.toLocaleString('es-AR')}
                        </Table.Td>
                        <Table.Td>
                          {prod.stock <= 0 ? (
                            <Badge color="red">0 (Agotado)</Badge>
                          ) : prod.stock <= 3 ? (
                            <Badge color="orange">{prod.stock} unid.</Badge>
                          ) : (
                            <Badge color="teal" variant="light">{prod.stock} unid.</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={prod.isActive ? 'green' : 'gray'}>
                            {prod.isActive ? 'Activo' : 'Pausado'}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleOpenEdit(prod)}
                            >
                              <IconEdit size={18} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteProduct(prod.id)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        {/* TAB 2: TENANT & BRANDING CONFIGURATION */}
        <Tabs.Panel value="tenant">
          <Paper withBorder radius="lg" p="lg" maw={700}>
            <Title order={4} mb="xs">
              Configuración de Marca y Tenant
            </Title>
            <Text size="sm" c="dimmed" mb="lg">
              Personaliza el nombre, logo, slug y colores de la tienda.
            </Text>

            <form onSubmit={handleSaveTenantSettings}>
              <Stack gap="md">
                <TextInput
                  required
                  label="Nombre de la Tienda"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />

                <TextInput
                  required
                  label="Slug / Identificador del Tenant"
                  description="Identificador único para el direccionamiento multi-tenant"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                />

                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    Logo de la Tienda
                  </Text>
                  <Group gap="xs" align="flex-end" mb="xs">
                    <TextInput
                      style={{ flex: 1 }}
                      placeholder="URL del logo (https://...) o sube un archivo"
                      value={tenantLogo}
                      onChange={(e) => setTenantLogo(e.target.value)}
                    />
                    <FileButton
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          type="button"
                          variant="light"
                          color="violet"
                          leftSection={<IconUpload size={16} />}
                          loading={uploadingLogo}
                        >
                          Subir Archivo
                        </Button>
                      )}
                    </FileButton>
                  </Group>

                  {tenantLogo && (
                    <Box mt="xs">
                      <Text size="xs" fw={600} c="dimmed" mb={4}>
                        Vista previa del Logo:
                      </Text>
                      <Image
                        src={tenantLogo}
                        w={80}
                        h={80}
                        radius="md"
                        fit="cover"
                        fallbackSrc="https://placehold.co/100x100?text=Error"
                      />
                    </Box>
                  )}
                </Box>

                <Textarea
                  label="Descripción del Negocio"
                  rows={3}
                  value={tenantDesc}
                  onChange={(e) => setTenantDesc(e.target.value)}
                />

                <TextInput
                  label="Correo de Contacto"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                />

                <ColorInput
                  label="Color Primario de Marca"
                  value={tenantColor}
                  onChange={setTenantColor}
                />

                <Button
                  type="submit"
                  color="violet"
                  mt="sm"
                  loading={savingTenant}
                  leftSection={<IconCheck size={16} />}
                >
                  Guardar Configuración
                </Button>
              </Stack>
            </form>
          </Paper>
        </Tabs.Panel>

        {/* TAB 3: ORDERS */}
        <Tabs.Panel value="orders">
          <Paper withBorder radius="lg" p="md">
            <Title order={4} mb="md">
              Pedidos Recibidos
            </Title>
            {orders.length === 0 ? (
              <Alert color="gray">No se han registrado pedidos todavía.</Alert>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>ID Pedido</Table.Th>
                      <Table.Th>Cliente</Table.Th>
                      <Table.Th>Items</Table.Th>
                      <Table.Th>Total</Table.Th>
                      <Table.Th>Estado Mercado Pago</Table.Th>
                      <Table.Th>Fecha</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {orders.map((ord) => (
                      <Table.Tr key={ord.id}>
                        <Table.Td fw={700}>#{ord.id}</Table.Td>
                        <Table.Td>
                          <Text size="sm">{ord.customerName}</Text>
                          <Text size="xs" c="dimmed">{ord.customerEmail}</Text>
                        </Table.Td>
                        <Table.Td>{ord.items.length} productos</Table.Td>
                        <Table.Td fw={700}>
                          $ {ord.totalAmount.toLocaleString('es-AR')} {ord.currency}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={ord.status === 'approved' ? 'green' : 'yellow'}>
                            {ord.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs">
                            {new Date(ord.createdAt).toLocaleDateString('es-AR')}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* MODAL: ADD / EDIT PRODUCT */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Text fw={700} size="lg">
            {editingProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </Text>
        }
        size="lg"
        radius="lg"
      >
        {editingProduct && (
          <form onSubmit={handleSaveProduct}>
            <Stack gap="sm">
              <TextInput
                required
                label="Título del Producto"
                placeholder="Ej. Auriculares Inalámbricos Pro"
                value={editingProduct.title || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, title: e.target.value })
                }
              />

              <SimpleGrid cols={2}>
                <NumberInput
                  required
                  label="Precio ($ ARS)"
                  min={0}
                  thousandSeparator="."
                  decimalSeparator=","
                  value={editingProduct.price || 0}
                  onChange={(val) =>
                    setEditingProduct({ ...editingProduct, price: Number(val) || 0 })
                  }
                />

                <NumberInput
                  required
                  label="Unidades Disponibles (Stock)"
                  min={0}
                  value={editingProduct.stock || 0}
                  onChange={(val) =>
                    setEditingProduct({ ...editingProduct, stock: Number(val) || 0 })
                  }
                />
              </SimpleGrid>

              <Select
                label="Tipo / Categoría"
                data={['Audio', 'Wearables', 'Accesorios', 'Gaming', 'Hogar', 'Moda', 'Tecnología', 'General']}
                value={editingProduct.category || 'General'}
                onChange={(val) =>
                  setEditingProduct({ ...editingProduct, category: val || 'General' })
                }
              />

              <Textarea
                required
                label="Descripción del Producto"
                rows={3}
                placeholder="Detalla las características, medidas o especificaciones..."
                value={editingProduct.description || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
              />

              {/* Photos Management */}
              <Box>
                <Group justify="space-between" align="center" mb={6}>
                  <Text size="sm" fw={600}>
                    Fotografías del Producto ({imagesList.length})
                  </Text>
                  <Text size="xs" c="dimmed">
                    JPG, PNG, WEBP, GIF
                  </Text>
                </Group>

                {/* Upload & URL Input Controls */}
                <Stack gap="xs" mb="sm">
                  <Group gap="sm" wrap="wrap">
                    <FileButton
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          type="button"
                          variant="filled"
                          color="violet"
                          leftSection={<IconUpload size={16} />}
                          loading={uploadingImage}
                        >
                          Subir Foto desde dispositivo
                        </Button>
                      )}
                    </FileButton>
                  </Group>

                  <Group gap="xs" align="flex-end">
                    <TextInput
                      placeholder="O pega una URL directa (https://...)"
                      style={{ flex: 1 }}
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      rightSection={
                        imageUrlInput ? (
                          <ActionIcon
                            type="button"
                            size="xs"
                            variant="subtle"
                            color="gray"
                            onClick={() => setImageUrlInput('')}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        ) : undefined
                      }
                    />
                    <Button
                      type="button"
                      variant="light"
                      color="violet"
                      onClick={handleAddImageUrl}
                      leftSection={<IconLink size={16} />}
                      disabled={!imageUrlInput.trim()}
                    >
                      Añadir URL
                    </Button>
                  </Group>

                  {/* 1-Click Sample Photos */}
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>
                      Fotos de muestra rápidas:
                    </Text>
                    <Group gap={6} wrap="wrap">
                      {SAMPLE_PRODUCT_IMAGES.map((sample) => (
                        <Button
                          key={sample.label}
                          type="button"
                          variant="default"
                          size="compact-xs"
                          radius="xl"
                          onClick={() => handleAddSampleImage(sample.url)}
                        >
                          + {sample.label}
                        </Button>
                      ))}
                    </Group>
                  </Box>
                </Stack>

                {/* Photos List / Gallery */}
                {imagesList.length > 0 ? (
                  <Box
                    p="xs"
                    style={{
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 8,
                      backgroundColor: 'var(--mantine-color-default-hover)',
                    }}
                  >
                    <Text size="xs" c="dimmed" mb={8}>
                      La primera foto es la portada del producto en el catálogo. Usa la estrella para cambiar la portada.
                    </Text>
                    <Group gap="sm" wrap="wrap">
                      {imagesList.map((url, i) => (
                        <Box
                          key={i}
                          style={{
                            position: 'relative',
                            width: 84,
                            height: 84,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border:
                              i === 0
                                ? '2px solid var(--mantine-color-violet-6)'
                                : '1px solid var(--mantine-color-default-border)',
                            backgroundColor: '#fff',
                          }}
                        >
                          <Image src={url} w={84} h={84} fit="cover" alt={`foto-${i}`} />

                          {/* Primary indicator */}
                          {i === 0 ? (
                            <Badge
                              size="xs"
                              variant="filled"
                              color="violet"
                              style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                pointerEvents: 'none',
                                fontSize: 9,
                                height: 16,
                                padding: '0 4px',
                              }}
                            >
                              Portada
                            </Badge>
                          ) : (
                            <Tooltip label="Definir como foto de portada" withArrow position="top">
                              <ActionIcon
                                type="button"
                                size="xs"
                                color="yellow"
                                variant="filled"
                                style={{ position: 'absolute', bottom: 4, left: 4 }}
                                onClick={() => handleSetPrimaryImage(i)}
                              >
                                <IconStar size={12} />
                              </ActionIcon>
                            </Tooltip>
                          )}

                          {/* Remove button */}
                          <Tooltip label="Eliminar foto" withArrow position="top">
                            <ActionIcon
                              type="button"
                              size="xs"
                              color="red"
                              variant="filled"
                              style={{ position: 'absolute', top: 4, right: 4 }}
                              onClick={() => handleRemoveImage(i)}
                            >
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Tooltip>
                        </Box>
                      ))}
                    </Group>
                  </Box>
                ) : (
                  <Alert color="gray" py="xs" icon={<IconPhoto size={16} />}>
                    Añade al menos una foto para que se muestre en el catálogo y checkout.
                  </Alert>
                )}
              </Box>

              <Switch
                label="Producto activo y visible en el catálogo"
                checked={editingProduct.isActive ?? true}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, isActive: e.currentTarget.checked })
                }
              />

              <Group justify="flex-end" mt="md">
                <Button type="button" variant="subtle" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" color="violet">
                  Guardar Producto
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Container>
  );
}
