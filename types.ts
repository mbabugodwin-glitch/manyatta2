import React from 'react';

export type PropertyType = 'mountain' | 'safari' | 'urban';

export interface NavigationLink {
  name: string;
  path: string;
  submenu?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
  }[];
}

export interface Amenity {
  icon: React.ReactNode;
  label: string;
}

export interface PricingTier {
  title: string;
  price: string;
  unit: string;
  features: string[];
}

export interface Activity {
  title: string;
  description: string;
  image: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  lodging: string;
}

export interface Itinerary {
  id: string;
  title: string;
  duration: string;
  locations: string[];
  description: string;
  image: string;
  pricePerPerson: string;
  days: ItineraryDay[];
}

export interface Apartment {
  id: string;
  name: string;
  bedrooms: number;
  salePrice?: string;
  rentLongTerm: string;
  rentShortTerm: string;
  image: string;
  features: string[];
}

export interface SafariLocationLodging {
  name: string;
  type: 'luxury' | 'mid-range' | 'budget' | 'tented';
  pricePerNight?: string;
}

export interface SafariLocation {
  id: string;
  name: string;
  region: string;
  description: string;
  imageUrl: string;
  mapCoordinates: {
    x: number;
    y: number;
  };
  wildlife: string[];
  lodging: SafariLocationLodging[];
  bestTimeToVisit?: string;
  accessibleFrom?: string;
  distanceFromNairobi?: string;
  visitCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SafariMapInteraction {
  id: string;
  user_id: string;
  location_id: string;
  interaction_type: 'view' | 'click' | 'hover' | 'booking_initiated' | 'info_opened';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SafariMapInteractionPayload {
  locationId: string;
  interactionType: 'view' | 'click' | 'hover' | 'booking_initiated' | 'info_opened';
  metadata?: Record<string, unknown>;
}

// Database Schema Types (Matches Implementation Plan)
export interface Property {
  id: string;
  type: 'mountain_villa' | 'safari' | 'apartment';
  name: string;
  location: string;
  description: string;
  base_price: number;
  currency: 'KES' | 'USD';
  max_guests: number;
  status: 'available' | 'maintenance';
}