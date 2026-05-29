// NOVA GRAPHIK — curated Lucide icon registry.
// The brand uses thin even-stroke (1.5–2px) line icons (Lucide).
// We register only the icons used across the site for tree-shaking,
// and expose a kebab-case `name` lookup matching the design source.
import type { Component } from 'vue'
import {
  Palette, Printer, Share2, Clapperboard, Box, Camera, Monitor, Mail,
  ArrowRight, ArrowUpRight, ArrowLeft, Check, Eye, EyeOff, LayoutDashboard,
  FileText, Image as ImageIcon, PenLine, Users, Tag, Settings, Plus,
  GripVertical, Phone, MapPin, Quote,
  Sparkles, Menu, X, LogOut, Lock, Save, Trash2, ChevronUp, ChevronDown,
} from '@lucide/vue'
import { Instagram, Facebook, Youtube, Tiktok } from './socialIcons'

export const ICONS: Record<string, Component> = {
  'palette': Palette,
  'printer': Printer,
  'share-2': Share2,
  'clapperboard': Clapperboard,
  'box': Box,
  'camera': Camera,
  'monitor': Monitor,
  'mail': Mail,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'arrow-left': ArrowLeft,
  'check': Check,
  'eye': Eye,
  'eye-off': EyeOff,
  'layout-dashboard': LayoutDashboard,
  'file-text': FileText,
  'image': ImageIcon,
  'pen-line': PenLine,
  'users': Users,
  'tag': Tag,
  'settings': Settings,
  'plus': Plus,
  'grip-vertical': GripVertical,
  'phone': Phone,
  'map-pin': MapPin,
  'instagram': Instagram,
  'facebook': Facebook,
  'youtube': Youtube,
  'tiktok': Tiktok,
  'quote': Quote,
  'sparkles': Sparkles,
  'menu': Menu,
  'x': X,
  'log-out': LogOut,
  'lock': Lock,
  'save': Save,
  'trash-2': Trash2,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
}

export type IconName = keyof typeof ICONS
