/**
 * Sends a WhatsApp message by opening WhatsApp with pre-filled text
 * @param phoneNumber - WhatsApp phone number with country code (e.g., +1234567890)
 * @param message - Message text to pre-fill
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Generates a WhatsApp message for order confirmation
 * @param items - Array of items in the cart
 * @param brandName - Brand name to include in message
 * @returns Formatted WhatsApp message
 */
export const generateOrderMessage = (items: any[], brandName: string): string => {
  let message = `Hi ${brandName}, I would like to order:\n\n`;
  
  items.forEach((item) => {
    message += `${item.name} x${item.quantity} - ₵${item.price * item.quantity}\n`;
  });

  message += `\nTotal: ₵${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}\n\nPlease confirm final price and shipping cost to my country.`;
  
  return message;
};

/**
 * Generates a custom order message for WhatsApp
 * @param formData - Form data with custom order details
 * @param brandName - Brand name to include in message
 * @returns Formatted WhatsApp message
 */
export const generateCustomOrderMessage = (formData: any, brandName: string): string => {
  let message = `Hi ${brandName}, I have a custom order request:\n\n`;
  
  message += `Product Link: ${formData.productLink}\n`;
  message += `Description: ${formData.description}\n`;
  message += `Quantity: ${formData.quantity}\n`;
  message += `Shipping Country: ${formData.country}\n`;
  
  if (formData.referenceImage) {
    message += `Reference Image: ${formData.referenceImage}\n`;
  }
  
  message += `\nPlease provide a quote for this order.`;
  
  return message;
};

/**
 * Formats currency with proper symbol
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
};

/**
 * Generates URL-friendly slug from text
 * @param text - Text to convert to slug
 * @returns Slug string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncates text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Replaces placeholder {{BRAND_NAME}} with actual brand name
 * @param text - Text containing placeholder
 * @param brandName - Brand name to replace with
 * @returns Text with brand name replaced
 */
export const replaceBrandName = (text: string, brandName: string): string => {
  return text.replace(/\{\{BRAND_NAME\}\}/g, brandName);
};

/**
 * Gets the BRAND_NAME from environment or uses default
 * @returns Brand name
 */
export const getBrandName = (): string => {
  return import.meta.env.VITE_BRAND_NAME || 'HopeLink Imports';
};

/**
 * Gets the admin email address with sanitized domain
 * @returns Admin email address
 */
export const getAdminEmail = (brandNameOverride?: string): string => {
  const brandName = brandNameOverride || getBrandName();
  // Sanitize brand name: remove spaces, special chars, convert to lowercase
  const sanitizedDomain = brandName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `admin@${sanitizedDomain}.com`;
};

/**
 * Gets the support email address with sanitized domain
 * @returns Support email address
 */
export const getSupportEmail = (brandNameOverride?: string): string => {
  const brandName = brandNameOverride || getBrandName();
  // Sanitize brand name: remove spaces, special chars, convert to lowercase
  const sanitizedDomain = brandName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return `support@${sanitizedDomain}.com`;
};

/**
 * Formats date in a readable way
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
