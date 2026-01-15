/**
 * Frontend Implementation Examples
 * Quick reference for using the new design system and image optimization
 */

// ============ EXAMPLE 1: Using Design Tokens in Components ============
import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../tokens';

export const StyledComponent = () => {
  return (
    <div
      style={{
        padding: SPACING[6], // 24px
        backgroundColor: COLORS.primaryBg,
        borderRadius: '12px',
        boxShadow: SHADOWS.lg,
      }}
    >
      <h2
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.serif,
          fontSize: TYPOGRAPHY.fontSize['2xl'], // 24px
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.primary,
          marginBottom: SPACING[4], // 16px
        }}
      >
        Welcome to New Manyatta
      </h2>
      <p
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.sans,
          fontSize: TYPOGRAPHY.fontSize.lg,
          color: COLORS.gray[600],
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
        }}
      >
        Experience luxury in the wild
      </p>
    </div>
  );
};

// ============ EXAMPLE 2: Responsive Hero Image ============
import OptimizedImage from './OptimizedImage';
import { generateSrcSet, getResponsiveSizes } from '../hooks/useImageOptimization';

export const HeroSection = () => {
  const imagePath = '/assets/Mountain Villas Hero Image/hero-villa';
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <OptimizedImage
        src={`${imagePath}.jpg`}
        alt="Luxury mountain villa with mountain view"
        srcSet={generateSrcSet(imagePath, 'jpg', [480, 768, 1024, 1440, 1920])}
        sizes={getResponsiveSizes('hero')} // (max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw
        fill={true}
        objectFit="cover"
        priority={true} // This is hero, prioritize loading
        className="w-full h-full"
      />
    </div>
  );
};

// ============ EXAMPLE 3: Responsive Card with Image ============
export const PropertyCard = ({ 
  name, 
  imagePath, 
  price 
}: { 
  name: string; 
  imagePath: string; 
  price: string;
}) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: SHADOWS.md,
        transition: SHADOWS.base,
      }}
      className="hover:shadow-2xl transition-shadow"
    >
      {/* Card Image */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-200">
        <OptimizedImage
          src={imagePath}
          alt={name}
          srcSet={generateSrcSet(imagePath, 'jpg', [480, 768, 1024])}
          sizes={getResponsiveSizes('card')} // (max-width: 640px) 100vw, ...
          fill={true}
          objectFit="cover"
          priority={false} // Card images are below fold
          className="w-full h-full"
        />
      </div>

      {/* Card Content */}
      <div style={{ padding: SPACING[6] }}>
        <h3
          style={{
            fontFamily: TYPOGRAPHY.fontFamily.serif,
            fontSize: TYPOGRAPHY.fontSize.xl,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.dark,
            marginBottom: SPACING[2],
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontSize: TYPOGRAPHY.fontSize.base,
            color: COLORS.gray[600],
            marginBottom: SPACING[4],
          }}
        >
          Discover luxury in Kenya's most breathtaking locations
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.primary,
            }}
          >
            From {price}
          </span>
          <button
            style={{
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              padding: `${SPACING[2]} ${SPACING[4]}`,
              borderRadius: SPACING[3],
              border: 'none',
              cursor: 'pointer',
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              transition: TRANSITIONS.base,
            }}
            className="hover:opacity-90"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ EXAMPLE 4: Responsive Grid Layout ============
export const PropertyGrid = ({ properties }) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      style={{
        padding: `${SPACING[12]} ${SPACING[6]}`,
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          name={property.name}
          imagePath={property.imagePath}
          price={property.price}
        />
      ))}
    </div>
  );
};

// ============ EXAMPLE 5: Responsive Typography Scale ============
export const TypographyExample = () => {
  return (
    <div style={{ padding: SPACING[8] }}>
      <h1
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.serif,
          fontSize: TYPOGRAPHY.fontSize['5xl'], // 48px
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: COLORS.dark,
          marginBottom: SPACING[2],
        }}
        className="sm:text-3xl md:text-4xl lg:text-5xl" // Responsive via Tailwind
      >
        H1 - Page Title
      </h1>

      <h2
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.serif,
          fontSize: TYPOGRAPHY.fontSize['3xl'],
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.primary,
          marginBottom: SPACING[3],
          marginTop: SPACING[6],
        }}
      >
        H2 - Section Header
      </h2>

      <h3
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.serif,
          fontSize: TYPOGRAPHY.fontSize['2xl'],
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          color: COLORS.dark,
          marginBottom: SPACING[2],
          marginTop: SPACING[4],
        }}
      >
        H3 - Subsection
      </h3>

      <p
        style={{
          fontFamily: TYPOGRAPHY.fontFamily.sans,
          fontSize: TYPOGRAPHY.fontSize.base,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
          color: COLORS.gray[700],
          maxWidth: '65ch',
          marginBottom: SPACING[4],
        }}
      >
        This is body text. Use a clear sans-serif font with good line height for readability.
      </p>

      <small
        style={{
          fontSize: TYPOGRAPHY.fontSize.sm,
          color: COLORS.gray[500],
          fontWeight: TYPOGRAPHY.fontWeight.normal,
        }}
      >
        Small text for captions and helper text
      </small>
    </div>
  );
};

// ============ EXAMPLE 6: Responsive Button with Tokens ============
export const ButtonExamples = () => {
  const buttonBaseStyle = {
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.base,
    padding: `${SPACING[3]} ${SPACING[6]}`,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: TRANSITIONS.base,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  };

  return (
    <div style={{ display: 'flex', gap: SPACING[4], padding: SPACING[8] }}>
      <button
        style={{
          ...buttonBaseStyle,
          backgroundColor: COLORS.primary,
          color: COLORS.white,
        }}
        className="hover:opacity-90 active:scale-95"
      >
        Primary Button
      </button>

      <button
        style={{
          ...buttonBaseStyle,
          backgroundColor: COLORS.gray[200],
          color: COLORS.dark,
        }}
        className="hover:bg-gray-300"
      >
        Secondary Button
      </button>

      <button
        style={{
          ...buttonBaseStyle,
          backgroundColor: 'transparent',
          color: COLORS.primary,
          border: `2px solid ${COLORS.primary}`,
        }}
        className="hover:bg-primary hover:text-white"
      >
        Outline Button
      </button>
    </div>
  );
};

// ============ EXAMPLE 7: Lazy-Loading Gallery ============
export const GallerySection = ({ images }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: SPACING[6],
        padding: SPACING[8],
      }}
    >
      {images.map((image, index) => (
        <figure
          key={index}
          style={{
            margin: 0,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: SHADOWS.md,
          }}
        >
          <div style={{ position: 'relative', width: '100%', paddingBottom: '66.67%' }}>
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              srcSet={generateSrcSet(image.src, 'jpg')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fill={true}
              objectFit="cover"
              priority={index < 3} // Prioritize first 3 images
              className="w-full h-full"
            />
          </div>
          <figcaption
            style={{
              padding: SPACING[4],
              fontFamily: TYPOGRAPHY.fontFamily.sans,
              fontSize: TYPOGRAPHY.fontSize.sm,
              color: COLORS.gray[600],
              backgroundColor: COLORS.gray[50],
            }}
          >
            {image.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

// ============ EXAMPLE 8: Using Media Queries ============
import { MEDIA_QUERIES } from '../tokens';

export const ResponsiveContent = () => {
  const styles = `
    /* Desktop */
    @media ${MEDIA_QUERIES.lg} {
      .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${SPACING[8]};
      }
    }

    /* Tablet */
    @media ${MEDIA_QUERIES.md} {
      .content {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="content">
        {/* Content */}
      </div>
    </>
  );
};

// ============ IMPORT REFERENCE ============
/*
 * Core Tokens to Import:
 * import { 
 *   COLORS, 
 *   TYPOGRAPHY, 
 *   SPACING, 
 *   SHADOWS,
 *   BORDER_RADIUS,
 *   TRANSITIONS,
 *   Z_INDEX,
 *   MEDIA_QUERIES,
 *   IMAGE_SIZES,
 *   DEVICE_SIZES,
 *   COMPONENT_STYLES,
 * } from '../tokens';
 *
 * Image Utilities to Import:
 * import {
 *   generateSrcSet,
 *   generateMultiFormatSrcSet,
 *   getResponsiveSizes,
 *   createBlurPlaceholder,
 *   calculateResponsiveDimensions,
 * } from '../hooks/useImageOptimization';
 */

export default {
  StyledComponent,
  HeroSection,
  PropertyCard,
  PropertyGrid,
  TypographyExample,
  ButtonExamples,
  GallerySection,
  ResponsiveContent,
};
