export interface TimelineStep {
  key: string;
  label: string;
  state: 'done' | 'current' | 'upcoming' | 'cancelled';
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Esperando cotización',
  aceptado: 'Oferta aceptada',
  en_progreso: 'Trabajo en curso',
  completado: 'Finalizado',
  cancelado: 'Cancelado',
};

const TIMELINE_ORDER = ['pendiente', 'aceptado', 'en_progreso', 'completado'] as const;

const TIMELINE_LABELS: Record<(typeof TIMELINE_ORDER)[number], string> = {
  pendiente: 'Solicitud enviada',
  aceptado: 'Oferta aceptada',
  en_progreso: 'Trabajo en curso',
  completado: 'Finalizado',
};

export function serviceRequestStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function serviceRequestTimelineSteps(currentStatus: string): TimelineStep[] {
  if (currentStatus === 'cancelado') {
    return TIMELINE_ORDER.map((key) => ({
      key,
      label: TIMELINE_LABELS[key],
      state: 'cancelled' as const,
    }));
  }

  const currentIndex = TIMELINE_ORDER.indexOf(
    currentStatus as (typeof TIMELINE_ORDER)[number],
  );
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return TIMELINE_ORDER.map((key, index) => ({
    key,
    label: TIMELINE_LABELS[key],
    state:
      index < activeIndex ? 'done' : index === activeIndex ? 'current' : 'upcoming',
  }));
}
