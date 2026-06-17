import { Text, View } from 'react-native';

import { CompanyOrderPreview } from '../services/orders';

interface OrderInboxCardProps {
  preview: CompanyOrderPreview;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    carrito: 'Carrito',
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  return labels[status] ?? status;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleDateString('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function OrderInboxCard({ preview }: OrderInboxCardProps) {
  const { order, itemCount } = preview;
  const total = Number.parseFloat(order.total);

  return (
    <View className="rounded-xl border border-[#E2E8F0] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-[#0F172A]">
          Pedido #{order.id.slice(0, 8)}
        </Text>
        <Text className="text-xs font-semibold text-[#00A878]">
          {statusLabel(order.status)}
        </Text>
      </View>
      <Text className="mt-2 text-xs text-[#94A3B8]">
        {itemCount} producto(s) de tu ferretería
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-[#0F172A]">
          ${Number.isFinite(total) ? total.toFixed(2) : order.total}
        </Text>
        <Text className="text-xs text-[#94A3B8]">{formatDate(order.created_at)}</Text>
      </View>
    </View>
  );
}
