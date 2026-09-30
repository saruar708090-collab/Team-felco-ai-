export interface Product {
  id: string;
  name: string;
  description?: string;
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
  whatsappNumber?: string;
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

export interface GameItem {
  id: string;
  name: string;
  type: 'colour_trading' | 'aviator' | 'other';
  subtitle?: string;
  active: boolean;
  order?: number;
  badgeBg?: string;
  badgeText?: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomPaymentMethod {
  id: string;
  name: string;
  number: string;
  accountType?: string; // 'Personal' | 'Agent' | 'Wallet' | 'TRC20 Address' | etc.
  instructions?: string;
  active: boolean;
  offlineNotice?: string;
  iconType?: 'bkash' | 'nagad' | 'rocket' | 'binance' | 'upay' | 'bank' | 'generic';
  badgeColor?: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  siteTagline?: string;
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  trackOrderBannerTitle?: string;
  trackOrderBannerSubtitle?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  supportWhatsApp?: string;
  supportTelegram: string;
  telegramChannelUrl?: string;
  telegramSupportUsername?: string;
  supportText: string;
  businessHours: string;
  supportBannerImage?: string;
  bkashNumber: string;
  bkashActive?: boolean;
  bkashOfflineNotice?: string;
  nagadNumber: string;
  nagadActive?: boolean;
  nagadOfflineNotice?: string;
  rocketNumber: string;
  rocketActive?: boolean;
  rocketOfflineNotice?: string;
  customPaymentMethods?: CustomPaymentMethod[];
  autoVerifyEnabled?: boolean;
  paymentInstructions: string;
  scrollingNotice?: string;
  popupNoticeActive?: boolean;
  popupNoticeTitle?: string;
  popupNoticeText?: string;
  popupNoticeImage?: string;
  popupNoticeButtonText?: string;
  popupNoticeButtonLink?: string;
  footerAboutText?: string;
  footerCopyrightText?: string;
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
