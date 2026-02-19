import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === CART ===

export function useCart() {
  return useQuery({
    queryKey: [api.cart.get.path],
    queryFn: async () => {
      const res = await fetch(api.cart.get.path, { credentials: "include" });
      if (res.status === 401) return null; // Guest or not logged in
      if (!res.ok) throw new Error("Failed to fetch cart");
      return api.cart.get.responses[200].parse(await res.json());
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await fetch(api.cart.add.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
        credentials: "include",
      });
      
      if (res.status === 401) {
        throw new Error("Please login to add items to cart");
      }
      
      if (!res.ok) throw new Error("Failed to add to cart");
      return api.cart.add.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const url = buildUrl(api.cart.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return api.cart.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cart.remove.path, { id });
      const res = await fetch(url, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.cart.clear.path, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to clear cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });
}

// === ORDERS ===

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertOrder, 'userId' | 'total'>) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] }); // Cart is cleared on backend usually
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}
