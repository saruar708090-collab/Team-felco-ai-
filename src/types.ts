export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  youtubeUrl?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category?: string;
  active: boolean;
  soldOut?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id?: string;
  orderId: string;
  productId: string;
  productName: string;
  selectedGame: string;
  customerName: string;
  telegramId: string;
  whatsappNumber: string;
  paymentMethod: string;
  paymentTrxId: string;
  paymentScreenshotUrl: string;
  orderStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  couponCode?: string;
  discountAmount?: number;
  finalAmount?: number;
  createdAt: any;
  updatedAt?: any;
}

export interface StoreSettings {
  storeName: string;
  supportWhatsApp: string;
  supportTelegram: string;
  supportText: string;
  businessHours: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  paymentInstructions: string;
  scrollingNotice?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export interface OrderDraft {
  productId?: string;
  productName?: string;
  productPrice?: number;
  selectedGame?: string;
  paymentMethod?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  paymentInstructions?: string;
  customerName?: string;
  telegramId?: string;
  whatsappNumber?: string;
  paymentTrxId?: string;
  paymentScreenshotUrl?: string;
  couponCode?: string;
  discountAmount?: number;
  finalAmount?: number;
  productCategory?: string;
}
