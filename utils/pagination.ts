const API_MAX_LIMIT = 100;

type FetchPage<T> = (offset: number, limit: number) => Promise<{ items: T[]; total: number }>;

/** Recorre páginas respetando el límite máximo del backend (100). */
export async function fetchAllPages<T>(fetchPage: FetchPage<T>): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;

  while (true) {
    const { items, total } = await fetchPage(offset, API_MAX_LIMIT);
    all.push(...items);

    if (all.length >= total || items.length === 0) {
      break;
    }

    offset += API_MAX_LIMIT;
  }

  return all;
}

export { API_MAX_LIMIT };
