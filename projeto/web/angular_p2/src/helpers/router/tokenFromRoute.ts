import { ActivatedRoute } from '@angular/router';

export function tokenFromRoute(route: ActivatedRoute): string {
  const fragmentToken = new URLSearchParams(route.snapshot.fragment ?? '').get('token');

  // Mantém compatibilidade temporária com links enviados antes da migração para fragmentos.
  return fragmentToken ?? route.snapshot.queryParamMap.get('token') ?? '';
}
