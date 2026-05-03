import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'en' | 'hi';

// ─── English Translations ─────────────────────────────────────
const EN: Record<string, string> = {
  // Brand
  brand_name: 'zoieng',
  brand_tagline: 'Your Time, Our Priority',

  // Header
  tagline: 'Your Time, Our Priority',
  search_placeholder: 'Keyword, Part Number',
  cart: 'Cart',
  support: 'Support',
  login: 'Login / Register',
  lang_en: 'English',
  lang_hi: 'हिंदी',
  other: 'Other',
  categories: 'Categories',
  brand: 'Brand',
  economy_series: 'Economy Series',
  save_more: 'SAVE MORE',
  stock_clearance: 'Stock Clearance',
  technical: 'Technical',
  promotion: 'Promotion',
  about: 'About',
  quote_order: 'Quote / Order',

  // Categories
  search_by_category: 'Search by Category',
  automation: 'Automation Components',
  fasteners: 'Fasteners',
  materials: 'Materials',
  wiring: 'Wiring Components',
  electrical: 'Electrical & Controls',
  cutting_tools: 'Cutting Tools',
  processing_tools: 'Processing Tools',
  material_handling: 'Material Handling & Storage',
  safety: 'Safety & General Supplies',
  lab: 'Lab & Clean Room Supplies',
  press_die: 'Press Die Components',
  plastic_mold: 'Plastic Mold Components',
  injection_molding: 'Injection Molding Components',

  // Quick Access
  quote_and_order: 'Quote & Order',
  need_help: 'Need Help',
  order_history: 'Order History',
  quote_history: 'Quote History',
  track_shipment: 'Track Shipment',
  part_number_checker: 'Part Number Checker',
  free_cad: 'Free CAD Download',

  // Brand Hero (parallax section)
  hero_eyebrow: 'ZOIENG ENGINEERING',
  hero_title_1: 'Precision Components.',
  hero_title_2: 'Delivered On Time.',
  hero_subtitle: 'Over 20 million parts. 3D CAD downloads. Same-day quotes. Built for global industrial operations.',
  browse_catalog: 'Browse Catalog',
  request_a_quote: 'Request a Quote',

  // Sections
  popular_brand: 'Popular Brand',
  zoeing_channel: 'ZOIENG Channel',
  know_more: 'Know More',
  view_more: 'View More',
  load_more: 'Load More',
  price_from: 'Price from',
  starting_price: 'Starting Price',
  new_product: 'NEW PRODUCT',
  in_stock: 'In Stock',
  out_of_stock: 'Out of Stock',
  add_to_cart: 'Add to Cart',
  free_delivery: 'Free Ground Delivery',
  technical_support: 'Technical Support',
  cad_download: '3D CAD Free Download',

  // Footer
  customer_service: 'Customer Service',
  my_account: 'My Account',
  about_zoeing: 'About ZOIENG',
  related_sites: 'Related Sites',
  register: 'Register',
  how_to_use: 'How To Use',
  catalog_request: 'Catalog Request',
  inquiry: 'Inquiry',
  sitemap: 'Sitemap',
  request_quote: 'Request a Quote',
  company_profile: 'Company Profile',
  privacy_policy: 'Privacy Policy',
  terms_of_use: 'Terms of Use',
  payment_methods: 'Payment Methods',
};

// ─── Hindi Translations ───────────────────────────────────────
const HI: Record<string, string> = {
  brand_name: 'zoieng',
  brand_tagline: 'आपका समय, हमारी प्राथमिकता',

  tagline: 'आपका समय, हमारी प्राथमिकता',
  search_placeholder: 'कीवर्ड, पार्ट नंबर',
  cart: 'कार्ट',
  support: 'सहायता',
  login: 'लॉगिन / रजिस्टर',
  lang_en: 'English',
  lang_hi: 'हिंदी',
  other: 'अन्य',
  categories: 'श्रेणियाँ',
  brand: 'ब्रांड',
  economy_series: 'इकोनॉमी सीरीज',
  save_more: 'अधिक बचाएं',
  stock_clearance: 'स्टॉक क्लीयरेंस',
  technical: 'तकनीकी',
  promotion: 'प्रमोशन',
  about: 'के बारे में',
  quote_order: 'कोटेशन / ऑर्डर',

  search_by_category: 'श्रेणी द्वारा खोजें',
  automation: 'ऑटोमेशन कॉम्पोनेंट',
  fasteners: 'फास्टनर',
  materials: 'सामग्री',
  wiring: 'वायरिंग कॉम्पोनेंट',
  electrical: 'इलेक्ट्रिकल और कंट्रोल',
  cutting_tools: 'कटिंग टूल्स',
  processing_tools: 'प्रोसेसिंग टूल्स',
  material_handling: 'सामग्री प्रबंधन',
  safety: 'सुरक्षा आपूर्ति',
  lab: 'लैब आपूर्ति',
  press_die: 'प्रेस डाई कॉम्पोनेंट',
  plastic_mold: 'प्लास्टिक मोल्ड',
  injection_molding: 'इंजेक्शन मोल्डिंग',

  quote_and_order: 'कोटेशन और ऑर्डर',
  need_help: 'सहायता चाहिए',
  order_history: 'ऑर्डर इतिहास',
  quote_history: 'कोटेशन इतिहास',
  track_shipment: 'शिपमेंट ट्रैक करें',
  part_number_checker: 'पार्ट नंबर चेकर',
  free_cad: 'मुफ्त CAD डाउनलोड',

  hero_eyebrow: 'ZOIENG इंजीनियरिंग',
  hero_title_1: 'सटीक कॉम्पोनेंट।',
  hero_title_2: 'समय पर डिलीवर।',
  hero_subtitle: '2 करोड़ से अधिक पार्ट्स। 3D CAD डाउनलोड। उसी दिन कोटेशन। भारत के औद्योगिक भविष्य के लिए बनाया गया।',
  browse_catalog: 'कैटलॉग देखें',
  request_a_quote: 'कोटेशन अनुरोध',

  popular_brand: 'लोकप्रिय ब्रांड',
  zoeing_channel: 'ZOIENG चैनल',
  know_more: 'और जानें',
  view_more: 'और देखें',
  load_more: 'और लोड करें',
  price_from: 'मूल्य से',
  starting_price: 'शुरुआती मूल्य',
  new_product: 'नया उत्पाद',
  in_stock: 'स्टॉक में',
  out_of_stock: 'स्टॉक में नहीं',
  add_to_cart: 'कार्ट में जोड़ें',
  free_delivery: 'मुफ्त डिलीवरी',
  technical_support: 'तकनीकी सहायता',
  cad_download: '3D CAD मुफ्त डाउनलोड',

  customer_service: 'ग्राहक सेवा',
  my_account: 'मेरा खाता',
  about_zoeing: 'ZOIENG के बारे में',
  related_sites: 'संबंधित साइटें',
  register: 'रजिस्टर करें',
  how_to_use: 'कैसे उपयोग करें',
  catalog_request: 'कैटलॉग अनुरोध',
  inquiry: 'पूछताछ',
  sitemap: 'साइटमैप',
  request_quote: 'कोटेशन अनुरोध',
  company_profile: 'कंपनी प्रोफ़ाइल',
  privacy_policy: 'गोपनीयता नीति',
  terms_of_use: 'उपयोग की शर्तें',
  payment_methods: 'भुगतान तरीके',
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'zoeing_lang';
  private _lang = signal<Lang>('en');

  readonly lang = this._lang.asReadonly();
  private readonly _translations = computed(() =>
    this._lang() === 'en' ? EN : HI
  );

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Lang | null;
    if (saved === 'en' || saved === 'hi') this._lang.set(saved);
  }

  t(key: string): string {
    return this._translations()[key] ?? key;
  }

  setLanguage(lang: Lang): void {
    this._lang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
  }

  toggle(): void {
    this.setLanguage(this._lang() === 'en' ? 'hi' : 'en');
  }
}
