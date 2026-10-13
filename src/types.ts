export type TaskStatus = 'idle' | 'monitoring' | 'detected' | 'carted' | 'checking_out' | 'secured' | 'failed' | 'paused';

export interface DropItem {
  id: string;
  name: string;
  brand: string;
  storeId: string;
  storeName: string;
  imageUrl: string;
  retailPrice: number;
  estResalePrice: number;
  dropTime: string; // ISO string or human string
  dropDateDisplay: string;
  category: 'figure' | 'sneaker' | 'cards' | 'art';
  demand: 'Extreme' | 'High' | 'Moderate';
  sizes?: string[];
  description: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  storeType: 'shopify' | 'custom_api' | 'supreme' | 'snkrs_clone';
  url: string;
  status: 'connected' | 'testing' | 'offline';
  proxyLatencyMs: number;
  antiBotBypass: string;
  cartDelayMs: number;
}

export interface ShippingProfile {
  id: string;
  name: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  maskedCard: string; // e.g. "Visa ending 4242"
  isDefault?: boolean;
}

export interface BotTask {
  id: string;
  productId: string;
  productName: string;
  storeName: string;
  variant: string;
  quantity: number;
  maxPrice: number;
  profileId: string;
  profileName: string;
  status: TaskStatus;
  dropTime: string;
  retries: number;
  currentStep?: 'idle' | 'monitoring' | 'item_detected' | 'added_to_cart' | 'checking_out' | 'secured' | 'failed';
  stepTimingMs?: {
    monitoring?: number;
    detected?: number;
    carted?: number;
    checkout?: number;
    total?: number;
  };
  orderNumber?: string;
  failureReason?: string;
  runLogs?: string[];
}

export interface DropHistoryItem {
  id: string;
  taskName: string;
  productName: string;
  storeName: string;
  variant: string;
  retailPrice: number;
  resalePrice: number;
  date: string;
  checkoutMs: number;
  status: 'secured' | 'failed';
  orderId?: string;
  reason?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DETECT' | 'CART' | 'CHECKOUT' | 'SUCCESS' | 'WARN' | 'ERROR';
  taskId?: string;
  productName?: string;
  message: string;
  msDelta?: number;
}

export type MessageRole = 'user' | 'assistant';

export type CardType = 
  | 'task_preview'
  | 'task_run'
  | 'drops_list'
  | 'task_status'
  | 'profile_form'
  | 'profiles_list'
  | 'store_connect'
  | 'analytics'
  | 'logs'
  | 'quick_action';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  cardType?: CardType;
  cardData?: any;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdated: string;
  snippet: string;
  messages: ChatMessage[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warn' | 'error';
  timestamp: number;
}
