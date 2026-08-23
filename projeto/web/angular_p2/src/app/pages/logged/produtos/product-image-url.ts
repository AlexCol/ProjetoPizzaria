import { environment } from '../../../../environments/environment';

export function createProductImageUrl(banner: string | null | undefined, updatedAt?: string): string | undefined {
  const fileName = banner?.trim();
  if (!fileName) return undefined;

  const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({
    modulePath: 'products',
    fileName,
  });

  if (updatedAt) {
    params.set('v', updatedAt);
  }

  return `${apiBaseUrl}/File/view?${params.toString()}`;
}
