// Modular Firestore imports for Firebase v9+
// Fix: Importing from @firebase/firestore to ensure modular exports are correctly resolved
import { collection, query, where, getDocs, limit } from '@firebase/firestore';
import { db } from './firebase';

export function formatCurrency(value: number | null | undefined): string {
  if (value === undefined || value === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(dateString: any): string {
  if (!dateString) return 'N/A';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString.toDate?.() || new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return 'Data inválida';
  }
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Redimensiona e comprime uma imagem Base64 para reduzir o tamanho em disco.
 * Essencial para não ultrapassar o limite de 1MB por documento do Firestore.
 */
export const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      // Exportamos como JPEG para garantir compressão real
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str); // Fallback em caso de erro
  });
};

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
