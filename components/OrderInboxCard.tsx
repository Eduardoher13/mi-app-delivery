import { Text, View } from 'react-native';

import { CompanyOrderPreview } from '../services/orders';
import { formatCordoba } from '../utils/currency';

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderInboxCard({ preview }: OrderInboxCardProps) {
  const { order, clientName, lineDetails, companySubtotal } = preview;

  return (
    <View className="rounded-xl border border-[#E2E8F0] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-[#0F172A]">
          Pedido #{order.id.slice(0, 8)}
        </Text>
        <Text className="text-xs font-semibold text-[#1e3a8a]">
          {statusLabel(order.status)}
        </Text>
      </View>

      <Text className="mt-2 text-xs font-semibold text-[#0F172A]">
        Cliente: {clientName}
      </Text>
      <Text className="mt-1 text-xs text-[#94A3B8]">{formatDate(order.created_at)}</Text>

      <View className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2">
        {lineDetails.map((line) => (
          <View
            key={`${order.id}-${line.productId}`}
            className="flex-row items-center justify-between py-1"
          >
            <Text className="flex-1 pr-2 text-xs text-[#0F172A]" numberOfLines={2}>
              {line.productName}
            </Text>
            <Text className="text-xs font-semibold text-[#94A3B8]">×{line.quantity}</Text>
            <Text className="ml-2 min-w-[64px] text-right text-xs font-bold text-[#0F172A]">
              {formatCordoba(line.subtotal)}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-[#E2E8F0] pt-3">
        <Text className="text-xs text-[#94A3B8]">Subtotal ferretería</Text>
        <Text className="text-sm font-black text-[#1e3a8a]">
          {formatCordoba(companySubtotal)}
        </Text>
      </View>
    </View>
  );
}
