import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useProductImageUpload } from '../hooks/useProductImageUpload';
import {
  setProductImageUrl,
  updateProduct,
} from '../services/products';
import { Product } from '../types';
import { formatCordoba } from '../utils/currency';

type EditStep = 'menu' | 'name' | 'price';

interface EditProductModalProps {
  product: Product | null;
  companyId: string;
  visible: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditProductModal({
  product,
  companyId,
  visible,
  onClose,
  onUpdated,
}: EditProductModalProps) {
  const [step, setStep] = useState<EditStep>('menu');
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    pickImage,
    uploadProductImage,
    uploading: uploadingImage,
    error: uploadError,
  } = useProductImageUpload();

  useEffect(() => {
    if (product && visible) {
      setStep('menu');
      setEditName(product.name);
      setEditPrice(String(product.price));
      setError(null);
    }
  }, [product, visible]);

  const handleClose = () => {
    if (saving || uploadingImage) {
      return;
    }
    onClose();
  };

  const handleSaveName = async () => {
    if (!product) {
      return;
    }

    const trimmed = editName.trim();
    if (!trimmed) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProduct(product.id, { name: trimmed });
      onUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar nombre');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrice = async () => {
    if (!product) {
      return;
    }

    const parsed = Number.parseFloat(editPrice.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Ingresa un precio válido mayor a 0');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProduct(product.id, { price: parsed });
      onUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar precio');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeImage = async () => {
    if (!product) {
      return;
    }

    const uri = await pickImage();
    if (!uri) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const publicUrl = await uploadProductImage(uri, companyId, product.id);
      await setProductImageUrl(product.id, publicUrl);
      onUpdated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploadingImage;

  if (!product) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-6"
        onPress={handleClose}
      >
        <Pressable
          className="w-full max-w-sm rounded-2xl bg-white p-5"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="text-base font-black text-[#0F172A]">
            Editar producto
          </Text>
          <Text className="mt-1 text-xs text-[#94A3B8]" numberOfLines={2}>
            {product.name} · {formatCordoba(product.price)}
          </Text>

          {step === 'menu' ? (
            <View className="mt-4 gap-2">
              <Pressable
                className="flex-row items-center rounded-xl border border-[#E2E8F0] px-4 py-3"
                onPress={() => setStep('name')}
                disabled={busy}
              >
                <Ionicons name="text-outline" size={18} color="#1e3a8a" />
                <Text className="ml-3 text-sm font-semibold text-[#0F172A]">
                  Cambiar nombre
                </Text>
              </Pressable>
              <Pressable
                className="flex-row items-center rounded-xl border border-[#E2E8F0] px-4 py-3"
                onPress={() => setStep('price')}
                disabled={busy}
              >
                <Ionicons name="cash-outline" size={18} color="#1e3a8a" />
                <Text className="ml-3 text-sm font-semibold text-[#0F172A]">
                  Cambiar precio
                </Text>
              </Pressable>
              <Pressable
                className="flex-row items-center rounded-xl border border-[#E2E8F0] px-4 py-3"
                onPress={() => void handleChangeImage()}
                disabled={busy}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#1e3a8a" size="small" />
                ) : (
                  <Ionicons name="image-outline" size={18} color="#1e3a8a" />
                )}
                <Text className="ml-3 text-sm font-semibold text-[#0F172A]">
                  Cambiar imagen
                </Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'name' ? (
            <View className="mt-4">
              <Text className="mb-2 text-xs font-semibold text-[#64748B]">
                Nuevo nombre
              </Text>
              <TextInput
                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm"
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  className="flex-1 items-center rounded-lg bg-[#1e3a8a] py-2.5"
                  onPress={() => void handleSaveName()}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-xs font-bold text-white">Guardar</Text>
                  )}
                </Pressable>
                <Pressable
                  className="items-center rounded-lg border border-[#E2E8F0] px-4 py-2.5"
                  onPress={() => setStep('menu')}
                  disabled={busy}
                >
                  <Text className="text-xs font-bold text-[#0F172A]">Atrás</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {step === 'price' ? (
            <View className="mt-4">
              <Text className="mb-2 text-xs font-semibold text-[#64748B]">
                Nuevo precio (C$)
              </Text>
              <TextInput
                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm"
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="decimal-pad"
                autoFocus
              />
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  className="flex-1 items-center rounded-lg bg-[#1e3a8a] py-2.5"
                  onPress={() => void handleSavePrice()}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-xs font-bold text-white">Guardar</Text>
                  )}
                </Pressable>
                <Pressable
                  className="items-center rounded-lg border border-[#E2E8F0] px-4 py-2.5"
                  onPress={() => setStep('menu')}
                  disabled={busy}
                >
                  <Text className="text-xs font-bold text-[#0F172A]">Atrás</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {error ? (
            <Text className="mt-3 text-center text-xs text-red-600">{error}</Text>
          ) : null}
          {uploadError ? (
            <Text className="mt-2 text-center text-xs text-red-600">
              {uploadError}
            </Text>
          ) : null}

          {step === 'menu' ? (
            <Pressable
              className="mt-4 items-center py-2"
              onPress={handleClose}
              disabled={busy}
            >
              <Text className="text-xs font-bold text-[#94A3B8]">Cancelar</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
