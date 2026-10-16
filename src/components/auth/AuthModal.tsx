'use client';

import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Divider,
  Alert,
} from '@mantine/core';
import { IconBrandGoogle, IconMail, IconLock, IconUser, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { notifications } from '@mantine/notifications';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string | null>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  function getFriendlyErrorMessage(err: any): string {
    const code = err?.code || '';
    if (code === 'auth/configuration-not-found' || code.includes('configuration-not-found')) {
      return 'Authentication aún no está activado en tu Firebase Console. Ve a Firebase Console > Build > Authentication, haz clic en "Comenzar" y activa "Correo electrónico/contraseña".';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'El método de acceso seleccionado no está habilitado en Firebase Console > Authentication > Sign-in method.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'Este correo electrónico ya está registrado. Prueba iniciando sesión.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Correo o contraseña incorrectos.';
    }
    if (code === 'auth/weak-password') {
      return 'La contraseña debe tener un mínimo de 6 caracteres.';
    }
    return err?.message || 'Error en la autenticación. Por favor verifica tus datos.';
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await loginWithEmail(email, password);
        notifications.show({
          title: '¡Bienvenido!',
          message: 'Has iniciado sesión correctamente.',
          color: 'green',
        });
      } else {
        await registerWithEmail(email, password, name);
        notifications.show({
          title: 'Cuenta creada',
          message: 'Tu cuenta ha sido registrada con éxito.',
          color: 'green',
        });
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      notifications.show({
        title: '¡Bienvenido!',
        message: 'Sesión iniciada con Google.',
        color: 'green',
      });
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Text>
      }
      centered
      radius="lg"
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow mb="md">
          <Tabs.Tab value="login">Ingresar</Tabs.Tab>
          <Tabs.Tab value="register">Registrarse</Tabs.Tab>
        </Tabs.List>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Atención" color="red" mb="md" radius="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleEmailAuth}>
          <Stack gap="sm">
            {activeTab === 'register' && (
              <TextInput
                required
                label="Nombre completo"
                placeholder="Ej. Santiago Ojeda"
                leftSection={<IconUser size={16} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <TextInput
              required
              label="Correo electrónico"
              placeholder="tu@email.com"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              required
              label="Contraseña"
              placeholder="••••••••"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'violet', to: 'indigo', deg: 90 }}
              fullWidth
              mt="sm"
              loading={loading}
            >
              {activeTab === 'login' ? 'Acceder' : 'Registrarme'}
            </Button>
          </Stack>
        </form>

        <Divider label="O continúa con" labelPosition="center" my="lg" />

        <Button
          fullWidth
          variant="default"
          leftSection={<IconBrandGoogle size={18} color="#EA4335" />}
          onClick={handleGoogleAuth}
          loading={loading}
        >
          Google
        </Button>
      </Tabs>
    </Modal>
  );
}
