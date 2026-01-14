// Modular Firestore imports for Firebase v9+
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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
 * Converte uma string Base64 num Blob.
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Redimensiona e comprime uma imagem Base64.
 * CORREÇÃO: Preservação estrita de transparência para PNG.
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
      if (!ctx) return resolve(base64Str);

      // Limpar o canvas com transparência total antes de desenhar
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Deteção robusta de PNG
      const isPng = base64Str.toLowerCase().includes('image/png') || base64Str.toLowerCase().includes('.png');
      
      if (isPng) {
        // Para PNG, não usamos o parâmetro 'quality' no toDataURL do browser, 
        // pois isso forçaria a perda de canais de alfa em alguns motores.
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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