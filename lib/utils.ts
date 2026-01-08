
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export function formatCurrency(value: number | undefined): string {
  if (value === undefined) return 'N/A';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString));
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Gera um slug normalizado: lowercase, sem acentos, sem caracteres especiais.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')     // Remove os acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '')             // Remove tudo o que não é letra, número ou hífen
    .replace(/--+/g, '-')                // Evita hífens duplos
    .replace(/^-+/, '')                  // Remove hífen no início
    .replace(/-+$/, '');                 // Remove hífen no fim
}

/**
 * Consulta o Firestore para garantir um slug único.
 * Se existir, adiciona -2, -3, etc.
 */
export async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  const tenantsRef = collection(db, 'tenants');

  while (!isUnique) {
    const q = query(tenantsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  return slug;
}
