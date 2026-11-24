import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "../features/productos/types";
export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string;
  stock: number;
}
interface CartState {
  items: CartItem[];
  agregar: (producto: Producto) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (p) =>
        set((state) => {
          const previous = state.items.find((i) => i.producto_id === p.id);
          if (
            !p.activo ||
            !p.disponible ||
            (previous?.cantidad ?? 0) >= p.stock
          )
            return state;
          return {
            items: previous
              ? state.items.map((i) =>
                  i.producto_id === p.id
                    ? {
                        ...i,
                        cantidad: i.cantidad + 1,
                        stock: p.stock,
                        precio_unitario: p.precio_base,
                      }
                    : i,
                )
              : [
                  ...state.items,
                  {
                    producto_id: p.id,
                    nombre: p.nombre,
                    precio_unitario: p.precio_base,
                    cantidad: 1,
                    imagen_url: p.imagen_url,
                    stock: p.stock,
                  },
                ],
          };
        }),
      quitar: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== id),
        })),
      cambiarCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === id
              ? {
                  ...i,
                  cantidad: Math.max(
                    1,
                    Math.min(i.stock, Math.floor(cantidad)),
                  ),
                }
              : i,
          ),
        })),
      vaciar: () => set({ items: [] }),
      total: () =>
        Math.round(
          get().items.reduce(
            (sum, i) => sum + i.precio_unitario * i.cantidad,
            0,
          ) * 100,
        ) / 100,
    }),
    { name: "food-store-cart" },
  ),
);
