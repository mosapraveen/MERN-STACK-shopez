import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { products } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const products = await storage.getProducts(search, category);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === REVIEWS ===
  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.productId));
    res.json(reviews);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.reviews.create.input.parse(req.body);
      const user = req.user as any;
      const review = await storage.createReview({
        ...input,
        userId: user.claims.sub,
        productId: Number(req.params.productId)
      });
      res.status(201).json(review);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === CART ===
  app.get(api.cart.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const cart = await storage.getCart(user.claims.sub);
    res.json(cart);
  });

  app.post(api.cart.add.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.cart.add.input.parse(req.body);
      const user = req.user as any;
      const item = await storage.addToCart({
        userId: user.claims.sub,
        productId: input.productId,
        quantity: input.quantity
      });
      res.json(item);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch(api.cart.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.cart.update.input.parse(req.body);
      const item = await storage.updateCartItem(Number(req.params.id), input.quantity);
      res.json(item);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.cart.remove.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).end();
  });

  app.delete(api.cart.clear.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    await storage.clearCart(user.claims.sub);
    res.status(204).end();
  });

  // === ORDERS ===
  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.orders.create.input.parse(req.body);
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const cartItems = await storage.getCart(userId);
      if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

      const total = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      const order = await storage.createOrder({
        userId,
        status: "pending",
        total: total.toString(),
        address: input.address
      }, cartItems.map(item => ({
        orderId: 0, // placeholder, set in storage
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      })));

      await storage.clearCart(userId);
      
      res.status(201).json(order);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json(e.errors);
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const orders = await storage.getOrders(user.claims.sub);
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Authorization check
    const user = req.user as any;
    if (order.userId !== user.claims.sub) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  });

  // SEED DATA
  if (process.env.NODE_ENV !== "production") {
    const existing = await storage.getProducts();
    if (existing.length === 0) {
      console.log("Seeding database...");
      const products = [
        {
          name: "Elegant Gold Bangle",
          description: "A stunning gold bangle that adds a touch of sophistication to any outfit. Perfect for special occasions.",
          price: "129.99",
          category: "Fashion Accessories",
          imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
          stock: 10
        },
        {
          name: "Chic Leather Handbag",
          description: "Premium leather handbag with spacious compartments and elegant design.",
          price: "89.99",
          category: "Fashion Accessories",
          imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
          stock: 15
        },
        {
          name: "Wireless Noise-Cancelling Headphones",
          description: "Immerse yourself in music with these high-fidelity noise-cancelling headphones.",
          price: "199.99",
          category: "Electronics",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          stock: 20
        },
        {
          name: "Minimalist Wall Clock",
          description: "A sleek and modern wall clock to enhance your home decor.",
          price: "45.00",
          category: "Home Decor",
          imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c",
          stock: 30
        },
        {
          name: "Smart Watch Series 5",
          description: "Stay connected and track your fitness with the latest smart watch.",
          price: "249.99",
          category: "Electronics",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          stock: 25
        },
        {
          name: "Classic Denim Jacket",
          description: "A timeless denim jacket that never goes out of style.",
          price: "59.99",
          category: "Fashion Accessories",
          imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
          stock: 12
        }
      ];

      for (const p of products) {
        await storage.createProduct(p);
      }
      console.log("Seeding complete!");
    }
  }

  return httpServer;
}
