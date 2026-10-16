'use client';

import React, { useEffect, useState } from 'react';
import { Box, Loader, Group, Text, Alert } from '@mantine/core';
import { Wallet } from '@mercadopago/sdk-react';
import { initializeMercadoPagoClient } from '@/lib/mercadopago/client';

interface MercadoPagoWalletProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export function MercadoPagoWallet({
  preferenceId,
  onReady,
  onError,
}: MercadoPagoWalletProps) {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initializeMercadoPagoClient();
      setLoading(false);
    } catch (err: any) {
      console.error('Error initializing Mercado Pago SDK:', err);
      setInitError('No se pudo inicializar el SDK de Mercado Pago');
      setLoading(false);
    }
  }, []);

  if (initError) {
    return (
      <Alert color="orange" title="Aviso de Pasarela" radius="md">
        {initError}
      </Alert>
    );
  }

  if (loading || !preferenceId) {
    return (
      <Group justify="center" p="md">
        <Loader size="sm" color="blue" />
        <Text size="xs" c="dimmed">
          Cargando pasarela segura de Mercado Pago...
        </Text>
      </Group>
    );
  }

  return (
    <Box id="wallet_container" style={{ width: '100%', minHeight: 48 }}>
      <Wallet
        initialization={{
          preferenceId,
          redirectMode: 'self',
        }}
        customization={{
          theme: 'default',
          valueProp: 'security_safety',
          customStyle: {
            buttonBackground: 'blue',
            borderRadius: '8px',
          },
        }}
        onReady={() => {
          setLoading(false);
          onReady?.();
        }}
        onError={(error) => {
          console.warn('Mercado Pago Wallet Brick error:', error);
          onError?.(error);
        }}
      />
    </Box>
  );
}
