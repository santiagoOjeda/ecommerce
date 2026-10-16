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
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  IconCreditCard,
  IconTruckDelivery,
} from '@tabler/icons-react';

interface SlideItem {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface HeroSliderProps {
  customBannerUrl?: string;
  tenantName?: string;
}

export function HeroSlider({ customBannerUrl, tenantName }: HeroSliderProps) {
  const { colorScheme } = useMantineColorScheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      badge: 'Destacado de Temporada',
      badgeIcon: <IconSparkles size={13} />,
      badgeColor: 'violet',
      title: 'Tecnología & Innovación',
      description: 'Descubre dispositivos con entrega express y garantía asegurada.',
      imageUrl: customBannerUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'slide-2',
      badge: 'Hasta 6 Cuotas Sin Interés',
      badgeIcon: <IconCreditCard size={13} />,
      badgeColor: 'cyan',
      title: 'Mercado Pago Checkout',
      description: 'Paga de forma 100% segura con todas las tarjetas de crédito y débito.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'slide-3',
      badge: 'Envíos a Todo el País',
      badgeIcon: <IconTruckDelivery size={13} />,
      badgeColor: 'teal',
      title: `${tenantName || 'Nuestra Tienda'} Oficial`,
      description: 'Stock inmediato y seguimiento de tu compra en tiempo real.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Mobile swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <Box
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        height: 290,
        boxShadow:
          colorScheme === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.45)'
            : '0 10px 30px rgba(121, 84, 196, 0.12)',
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <Box
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
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
              fallbackSrc="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
            />

            {/* Dark & Vibrant Gradient Overlay */}
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(15, 12, 28, 0.88) 0%, rgba(20, 15, 40, 0.55) 50%, rgba(10, 10, 20, 0.25) 100%)',
              }}
            />

            {/* Slide Content */}
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.25rem 1.5rem',
                color: '#fff',
              }}
            >
              <Badge
                size="sm"
                variant="filled"
                color={slide.badgeColor}
                leftSection={slide.badgeIcon}
                mb={6}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: 10,
                }}
              >
                {slide.badge}
              </Badge>

              <Title
                order={3}
                style={{
                  color: '#ffffff',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  marginBottom: 4,
                  textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}
              >
                {slide.title}
              </Title>

              <Text
                size="xs"
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  maxWidth: 380,
                  lineHeight: 1.4,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                {slide.description}
              </Text>
            </Box>
          </Box>
        );
      })}

      {/* Navigation Arrows (Glassmorphism) */}
      <ActionIcon
        type="button"
        variant="filled"
        color="dark"
        radius="xl"
        size="md"
        onClick={handlePrev}
        aria-label="Slide anterior"
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(20, 20, 30, 0.55)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 4,
          transition: 'background-color 0.2s ease, transform 0.15s ease',
        }}
      >
        <IconChevronLeft size={18} />
      </ActionIcon>

      <ActionIcon
        type="button"
        variant="filled"
        color="dark"
        radius="xl"
        size="md"
        onClick={handleNext}
        aria-label="Slide siguiente"
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(20, 20, 30, 0.55)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 4,
          transition: 'background-color 0.2s ease, transform 0.15s ease',
        }}
      >
        <IconChevronRight size={18} />
      </ActionIcon>

      {/* Bottom Progress Indicator Dots */}
      <Group
        gap={6}
        justify="center"
        style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          zIndex: 5,
        }}
      >
        {slides.map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: isActive ? 22 : 6,
                height: 6,
                borderRadius: 4,
                backgroundColor: isActive ? '#a78bfa' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 0 8px rgba(167, 139, 250, 0.8)' : 'none',
              }}
            />
          );
        })}
      </Group>
    </Box>
  );
}
