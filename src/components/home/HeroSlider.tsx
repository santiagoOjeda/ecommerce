'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  Title,
  Badge,
  ActionIcon,
  Group,
  Button,
  Container,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  IconCreditCard,
  IconTruckDelivery,
  IconArrowRight,
  IconShieldCheck,
} from '@tabler/icons-react';

interface SlideItem {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  badgeGradient: { from: string; to: string; deg?: number };
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  perks: string[];
}

interface HeroSliderProps {
  customBannerUrl?: string;
  tenantName?: string;
  tenantDescription?: string;
}

export function HeroSlider({
  customBannerUrl,
  tenantName,
  tenantDescription,
}: HeroSliderProps) {
  const { colorScheme } = useMantineColorScheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      badge: 'Tienda Oficial Verificada',
      badgeIcon: <IconSparkles size={14} />,
      badgeGradient: { from: 'violet', to: 'indigo', deg: 90 },
      title: tenantName || 'Tecnología & Innovación',
      description:
        tenantDescription ||
        'Descubre nuestra selección exclusiva de productos con stock inmediato y envíos a todo el país.',
      ctaText: 'Explorar Catálogo',
      ctaHref: '#catalogo',
      imageUrl:
        customBannerUrl ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=85',
      perks: ['Garantía Oficial', 'Envíos Rápidos', 'Mercado Pago'],
    },
    {
      id: 'slide-2',
      badge: 'Mercado Pago Checkout',
      badgeIcon: <IconCreditCard size={14} />,
      badgeGradient: { from: 'blue', to: 'cyan', deg: 90 },
      title: 'Hasta 6 Cuotas Sin Interés',
      description:
        'Paga de forma 100% segura con tarjetas de crédito, débito y dinero en cuenta mediante Mercado Pago.',
      ctaText: 'Ver Promociones',
      ctaHref: '#catalogo',
      imageUrl:
        'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1600&auto=format&fit=crop&q=85',
      perks: ['Compra Protegida', 'Todas las Tarjetas', 'Checkout Pro'],
    },
    {
      id: 'slide-3',
      badge: 'Envíos a Todo el País',
      badgeIcon: <IconTruckDelivery size={14} />,
      badgeGradient: { from: 'teal', to: 'emerald', deg: 90 },
      title: 'Despachos Rápidos & Seguros',
      description:
        'Recibe tus productos con embalaje protegido y seguimiento en tiempo real de tu pedido.',
      ctaText: 'Comprar Ahora',
      ctaHref: '#catalogo',
      imageUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=85',
      perks: ['Seguimiento Online', 'Empaque Seguro', 'Atención Directa'],
    },
  ];

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <Box
      component="section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(320px, 42vw, 460px)',
        overflow: 'hidden',
        borderBottom: `1px solid ${
          colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        }`,
        backgroundColor: '#0a0a14',
      }}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <Box
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(1.03)',
              transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {/* Background Image */}
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              h="100%"
              w="100%"
              fit="cover"
              fallbackSrc="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=85"
            />

            {/* Cinematic Gradient Overlay */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(8, 7, 18, 0.94) 0%, rgba(14, 11, 30, 0.82) 45%, rgba(10, 8, 24, 0.45) 80%, rgba(8, 7, 18, 0.6) 100%)',
              }}
            />

            {/* Slide Content aligned to Container */}
            <Container
              size="xl"
              h="100%"
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Stack gap="sm" maw={640} py="xl">
                <Badge
                  size="md"
                  variant="gradient"
                  gradient={slide.badgeGradient}
                  leftSection={slide.badgeIcon}
                  style={{
                    alignSelf: 'flex-start',
                    boxShadow: '0 4px 14px rgba(121, 84, 196, 0.35)',
                    letterSpacing: '0.4px',
                    fontWeight: 700,
                  }}
                >
                  {slide.badge}
                </Badge>

                <Title
                  order={1}
                  style={{
                    color: '#ffffff',
                    fontSize: 'clamp(1.8rem, 4.2vw, 3.2rem)',
                    fontWeight: 900,
                    lineHeight: 1.12,
                    letterSpacing: '-0.8px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                  }}
                >
                  {slide.title}
                </Title>

                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.88)',
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                    lineHeight: 1.55,
                    maxWidth: 540,
                    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.description}
                </Text>

                <Group gap="md" mt="xs">
                  <Button
                    component="a"
                    href={slide.ctaHref}
                    size="md"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'indigo', deg: 90 }}
                    rightSection={<IconArrowRight size={18} />}
                    style={{
                      boxShadow: '0 4px 18px rgba(121, 84, 196, 0.45)',
                      fontWeight: 700,
                    }}
                  >
                    {slide.ctaText}
                  </Button>

                  <Group gap="xs" visibleFrom="xs">
                    {slide.perks.map((perk, pIdx) => (
                      <Group key={pIdx} gap={4} c="rgba(255, 255, 255, 0.8)">
                        <IconShieldCheck size={15} color="#a78bfa" />
                        <Text size="xs" fw={500}>
                          {perk}
                        </Text>
                      </Group>
                    ))}
                  </Group>
                </Group>
              </Stack>
            </Container>
          </Box>
        );
      })}

      {/* Previous Arrow Button */}
      <ActionIcon
        type="button"
        variant="filled"
        color="dark"
        radius="xl"
        size={42}
        onClick={handlePrev}
        aria-label="Slide anterior"
        style={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(15, 12, 28, 0.65)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 4,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        <IconChevronLeft size={22} />
      </ActionIcon>

      {/* Next Arrow Button */}
      <ActionIcon
        type="button"
        variant="filled"
        color="dark"
        radius="xl"
        size={42}
        onClick={handleNext}
        aria-label="Slide siguiente"
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(15, 12, 28, 0.65)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 4,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        <IconChevronRight size={22} />
      </ActionIcon>

      {/* Bottom Progress Indicator Dots */}
      <Group
        gap={8}
        justify="center"
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        {slides.map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              style={{
                width: isActive ? 28 : 8,
                height: 7,
                borderRadius: 4,
                backgroundColor: isActive ? '#a78bfa' : 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 0 12px rgba(167, 139, 250, 0.9)' : 'none',
              }}
            />
          );
        })}
      </Group>
    </Box>
  );
}
