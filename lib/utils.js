import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '0 Birr';
  const num = Math.round(Number(amount));
  return `${num.toLocaleString()} Birr`;
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return 'ETB 0';
  const num = Math.round(Number(amount));
  return `ETB ${num.toLocaleString()}`;
}

export function generateOrderNumber() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `KB-${year}-${randomDigits}`;
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
