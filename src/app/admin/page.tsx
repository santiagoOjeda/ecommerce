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
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useTenantStore } from '@/store/tenantStore';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { Product, Order } from '@/types';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

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

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImagesList([...imagesList, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
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
                No hay productos cargados aún. Haz clic en "Nuevo Producto" para añadir uno.
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

                <TextInput
                  label="URL del Logo"
                  description="Enlace directo a la imagen del logo"
                  placeholder="https://..."
                  value={tenantLogo}
                  onChange={(e) => setTenantLogo(e.target.value)}
                />

                {tenantLogo && (
                  <Box>
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
          <Title order={4}>
            {editingProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </Title>
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
                <Text size="sm" fw={500} mb={4}>
                  Fotografías del Producto
                </Text>
                <Group gap="xs" mb="xs">
                  <TextInput
                    placeholder="URL de la imagen (https://...)"
                    style={{ flex: 1 }}
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <Button variant="light" color="violet" onClick={handleAddImage}>
                    Añadir Foto
                  </Button>
                </Group>

                {imagesList.length > 0 && (
                  <Group gap="xs" mt="xs">
                    {imagesList.map((url, i) => (
                      <Box
                        key={i}
                        style={{
                          position: 'relative',
                          border: '1px solid var(--mantine-color-default-border)',
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <Image src={url} w={64} h={64} fit="cover" alt="prev" />
                        <ActionIcon
                          size="xs"
                          color="red"
                          variant="filled"
                          style={{ position: 'absolute', top: 2, right: 2 }}
                          onClick={() => handleRemoveImage(i)}
                        >
                          <IconTrash size={12} />
                        </ActionIcon>
                      </Box>
                    ))}
                  </Group>
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
                <Button variant="subtle" onClick={() => setModalOpen(false)}>
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
