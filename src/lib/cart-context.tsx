"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
    product: Product;
    size: string;
    color: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: Product, size: string, color: string) => void;
    removeItem: (productId: string, size: string, color: string) => void;
    updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback((product: Product, size: string, color: string) => {
        setItems((prev) => {
            const existing = prev.find(
                (item) => item.product.id === product.id && item.size === size && item.color === color
            );
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id && item.size === size && item.color === color
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, size, color, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((productId: string, size: string, color: string) => {
        setItems((prev) =>
            prev.filter(
                (item) => !(item.product.id === productId && item.size === size && item.color === color)
            )
        );
    }, []);

    const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId, size, color);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId && item.size === size && item.color === color
                    ? { ...item, quantity }
                    : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
