import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertProductSchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertInvoiceSchema,
  insertMarketplaceListingSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve categories" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const products = await storage.getProducts(req.user!.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validatedData = insertProductSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own products" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
      
      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Customers routes
  app.get("/api/customers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const customers = await storage.getCustomers(req.user!.id);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validatedData = insertCustomerSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orders = await storage.getOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Generate order number
      const orderNumber = `ORD-${Math.floor(Math.random() * 10000)}`;
      
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        orderNumber,
        userId: req.user!.id,
      });
      
      const order = await storage.createOrder(validatedData);
      
      // Add order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id,
          });
          await storage.addOrderItem(validatedItem);
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own orders" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const invoices = await storage.getInvoices(req.user!.id);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
      
      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        invoiceNumber,
        userId: req.user!.id,
      });
      
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["unpaid", "paid", "overdue"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own invoices" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Marketplace listings routes
  app.get("/api/marketplace", async (req, res) => {
    try {
      const listings = await storage.getListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve marketplace listings" });
    }
  });

  app.get("/api/marketplace/vendor", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const listings = await storage.getVendorListings(req.user!.id);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve vendor listings" });
    }
  });

  app.post("/api/marketplace", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validatedData = insertMarketplaceListingSchema.parse({
        ...req.body,
        vendorId: req.user!.id,
      });
      
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create marketplace listing" });
    }
  });

  // Return dashboard data
  app.get("/api/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user!.id;
      
      // Get recent orders
      const allOrders = await storage.getOrders(userId);
      const sortedOrders = [...allOrders].sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      const recentOrders = sortedOrders.slice(0, 4);
      
      // Get revenue
      const totalRevenue = allOrders.reduce((sum, order) => 
        sum + parseFloat(order.totalAmount.toString()), 0
      );
      
      // Get orders this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const ordersThisWeek = allOrders.filter(order => 
        new Date(order.orderDate) >= oneWeekAgo
      ).length;
      
      // Get inventory items count
      const products = await storage.getProducts(userId);
      const inventoryCount = products.length;
      
      // Get low stock alerts
      const lowStockThreshold = 10;
      const lowStockCount = products.filter(product => 
        product.quantity < lowStockThreshold
      ).length;
      
      // Get recent customers
      const customers = await storage.getCustomers(userId);
      const recentCustomers = customers.slice(0, 3);
      
      // Get inventory status by category
      const categories = await storage.getCategories();
      const inventoryStatus = categories.slice(0, 4).map(category => {
        const categoryProducts = products.filter(p => p.categoryId === category.id);
        const totalStock = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
        // Calculate percentage (mock data as we don't have total capacity)
        const percentage = Math.min(100, Math.max(0, Math.floor(Math.random() * 100)));
        
        return {
          name: category.name,
          percentage
        };
      });
      
      // Generate monthly sales data (mock for now)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const monthlySales = months.map(month => ({
        name: month,
        sales: Math.floor(Math.random() * 5000) + 1000
      }));
      
      res.json({
        revenue: totalRevenue,
        ordersThisWeek,
        inventoryCount,
        lowStockCount,
        recentOrders,
        recentCustomers,
        inventoryStatus,
        monthlySales
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve dashboard data" });
    }
  });

  return httpServer;
}
