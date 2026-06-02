import api from './api';

// ──────────────────────────────────────────────
// Types matching the backend CreateProductCommand
// ──────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  description?: string;
  categoryId: string; // Guid as string
}

// The backend returns Created<Guid> → { value: "guid-string" }
// The response body is the Guid itself (the id of the created product).
export interface CreateProductResponse {
  value: string;
}

// ──────────────────────────────────────────────
// API functions — endpoint: POST /api/Products
// ──────────────────────────────────────────────

/**
 * Calls `POST /api/Products` (the CreateProduct minimal-API endpoint).
 * Returns the new product's ID (Guid).
 */
export async function createProduct(data: CreateProductRequest): Promise<string> {
  // TypedResults.Created<Guid> returns status 201 with the Guid in the body
  const response = await api.post<string>('/Products', data);
  return response.data;
}
