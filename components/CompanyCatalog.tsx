import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useProductImageUpload } from '../hooks/useProductImageUpload';
import {
  createProduct,
  getProductsByCompany,
  setProductImageUrl,
} from '../services/products';
import { Company, Product } from '../types';

interface CompanyCatalogProps {
  company: Company;
}

export function CompanyCatalog({ company }: CompanyCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(
    null,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');

  const {
    pickImage,
    uploadProductImage,
    uploading: uploadingImage,
    error: uploadError,
  } = useProductImageUpload();

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const data = await getProductsByCompany(company.id);
      setProducts(data);
    } catch {
      setError('No se pudo cargar el catálogo. ¿Backend encendido?');
    } finally {
      setLoading(false);
    }
  }, [company.id]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('10');
    setShowForm(false);
  };

  const handleCreateAndUpload = async () => {
    if (!name.trim() || !price.trim()) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const created = await createProduct({
        company_id: company.id,
        name: name.trim(),
        description: description.trim() || 'Sin descripción',
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock, 10) || 0,
        is_active: true,
      });

      const uri = await pickImage();
      if (uri) {
        setUploadingProductId(created.id);
        const publicUrl = await uploadProductImage(uri, company.id, created.id);
        await setProductImageUrl(created.id, publicUrl);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setSaving(false);
      setUploadingProductId(null);
    }
  };

  const handleChangeImage = async (product: Product) => {
    const uri = await pickImage();
    if (!uri) {
      return;
    }

    setUploadingProductId(product.id);
    setError(null);

    try {
      const publicUrl = await uploadProductImage(uri, company.id, product.id);
      await setProductImageUrl(product.id, publicUrl);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingProductId(null);
    }
  };

  const busy = saving || uploadingImage;

  return (
    <View className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <Text className="text-sm font-black tracking-wide text-[#0F172A]">
        MI CATÁLOGO
      </Text>
      <Text className="mt-1 text-xs text-[#94A3B8]">
        {company.commercial_name} · {products.length} productos
      </Text>
      <Text className="mt-2 text-[10px] text-[#94A3B8]">
        Imágenes en Storage: product_images/image-product/{company.id}/
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-6" color="#1e3a8a" />
      ) : (
        <>
          {products.map((product) => (
            <View
              key={product.id}
              className="mt-4 flex-row items-center rounded-xl border border-[#E2E8F0] p-3"
            >
              <Image
                source={{ uri: product.imageUrl }}
                className="h-14 w-14 rounded-lg bg-[#E2E8F0]"
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-[#0F172A]" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text className="text-xs text-[#1e3a8a]">
                  ${product.price.toFixed(2)}
                </Text>
              </View>
              <Pressable
                className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                onPress={() => void handleChangeImage(product)}
                disabled={busy}
              >
                {uploadingProductId === product.id ? (
                  <ActivityIndicator color="#1e3a8a" size="small" />
                ) : (
                  <Text className="text-[10px] font-bold text-[#0F172A]">
                    Imagen
                  </Text>
                )}
              </Pressable>
            </View>
          ))}

          {products.length === 0 ? (
            <Text className="mt-4 text-center text-sm text-[#94A3B8]">
              Aún no tienes productos. Agrega el primero abajo.
            </Text>
          ) : null}

          {showForm ? (
            <View className="mt-4 rounded-xl bg-[#F8FAFC] p-3">
              <TextInput
                className="mb-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm"
                placeholder="Nombre del producto"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                className="mb-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm"
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <View className="mb-2 flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm"
                  placeholder="Precio"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  className="w-20 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm"
                  placeholder="Stock"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                />
              </View>
              <Text className="mb-3 text-[10px] text-[#94A3B8]">
                Al guardar se abrirá la galería para subir la foto a Supabase.
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 items-center rounded-lg bg-[#1e3a8a] py-2.5"
                  onPress={() => void handleCreateAndUpload()}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-xs font-bold text-white">
                      Crear + subir imagen
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  className="items-center rounded-lg border border-[#E2E8F0] px-4 py-2.5"
                  onPress={resetForm}
                  disabled={busy}
                >
                  <Text className="text-xs font-bold text-[#0F172A]">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              className="mt-4 items-center rounded-lg border border-dashed border-[#1e3a8a] py-3"
              onPress={() => setShowForm(true)}
            >
              <Text className="text-xs font-bold text-[#1e3a8a]">
                + Agregar producto
              </Text>
            </Pressable>
          )}
        </>
      )}

      {error ? (
        <Text className="mt-3 text-center text-xs text-red-600">{error}</Text>
      ) : null}
      {uploadError ? (
        <Text className="mt-2 text-center text-xs text-red-600">{uploadError}</Text>
      ) : null}
    </View>
  );
}
