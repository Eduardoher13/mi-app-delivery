import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  serviceRequestTimelineSteps,
  TimelineStep,
} from '../utils/serviceRequestStatus';

interface ServiceRequestTimelineProps {
  status: string;
}

function StepIcon({ step }: { step: TimelineStep }) {
  if (step.state === 'cancelled') {
    return <Ionicons name="close-circle" size={20} color="#94A3B8" />;
  }
  if (step.state === 'done') {
    return <Ionicons name="checkmark-circle" size={20} color="#1e3a8a" />;
  }
  if (step.state === 'current') {
    return <View className="h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a]">
      <View className="h-2 w-2 rounded-full bg-white" />
    </View>;
  }
  return <View className="h-5 w-5 rounded-full border-2 border-[#E2E8F0]" />;
}

export function ServiceRequestTimeline({ status }: ServiceRequestTimelineProps) {
  const steps = serviceRequestTimelineSteps(status);
  const isCancelled = status === 'cancelado';

  return (
    <View className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">
        PROGRESO
      </Text>
      {isCancelled ? (
        <Text className="mt-2 text-sm font-semibold text-red-600">
          Solicitud cancelada
        </Text>
      ) : null}
      <View className="mt-4">
        {steps.map((step, index) => (
          <View key={step.key} className="flex-row">
            <View className="items-center">
              <StepIcon step={step} />
              {index < steps.length - 1 ? (
                <View
                  className={`my-1 w-0.5 flex-1 min-h-[24px] ${
                    step.state === 'done' ? 'bg-[#1e3a8a]' : 'bg-[#E2E8F0]'
                  }`}
                />
              ) : null}
            </View>
            <View className="ml-3 flex-1 pb-4">
              <Text
                className={`text-sm font-semibold ${
                  step.state === 'current'
                    ? 'text-[#1e3a8a]'
                    : step.state === 'done'
                      ? 'text-[#0F172A]'
                      : 'text-[#94A3B8]'
                }`}
              >
                {step.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
