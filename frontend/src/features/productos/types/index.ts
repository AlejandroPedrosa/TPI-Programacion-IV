import type { Categoria } from "../../categorias/types";
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  categoria_id: number;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}
export interface Producto extends ProductoInput {
  id: number;
  activo: boolean;
  categoria: Categoria;
}
export interface ProductoFiltros {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}
