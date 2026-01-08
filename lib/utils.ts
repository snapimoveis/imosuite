
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
 * Converte uma string num slug URL-friendly
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')     // Remove os acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '')             // Remove caracteres não alfanuméricos (exceto hífens)
    .replace(/--+/g, '-');               // Remove hífens duplos
}

/**
 * Garante que um slug é único na coleção de tenants, 
 * adicionando sufixos numéricos se necessário (-2, -3...)
 */
export async function getUniqueTenantSlug(baseName: string): Promise<string> {
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
