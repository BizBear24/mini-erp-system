import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  users, customers, products, categories, orders, orderItems, invoices, marketplaceListings,
  type User, type InsertUser, 
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Invoice, type InsertInvoice,
  type MarketplaceListing, type InsertMarketplaceListing
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(userId: number): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Invoice methods
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByOrderId(orderId: number): Promise<Invoice | undefined>;
  getInvoices(userId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  // Marketplace listing methods
  getListing(id: number): Promise<MarketplaceListing | undefined>;
  getListings(): Promise<MarketplaceListing[]>;
  getVendorListings(vendorId: number): Promise<MarketplaceListing[]>;
  createListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Use any type to avoid the SessionStore type error
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private customersData: Map<number, Customer>;
  private productsData: Map<number, Product>;
  private categoriesData: Map<number, Category>;
  private ordersData: Map<number, Order>;
  private orderItemsData: Map<number, OrderItem>;
  private invoicesData: Map<number, Invoice>;
  private marketplaceListingsData: Map<number, MarketplaceListing>;
  
  sessionStore: any; // Use any type to avoid the SessionStore type error
  
  private userId: number;
  private productId: number;
  private categoryId: number;
  private customerId: number;
  private orderId: number;
  private orderItemId: number;
  private invoiceId: number;
  private listingId: number;

  constructor() {
    this.usersData = new Map();
    this.customersData = new Map();
    this.productsData = new Map();
    this.categoriesData = new Map();
    this.ordersData = new Map();
    this.orderItemsData = new Map();
    this.invoicesData = new Map();
    this.marketplaceListingsData = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.categoryId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.invoiceId = 1;
    this.listingId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize some categories
    this.createCategory({ name: "Office Supplies", description: "Stationery, paper, and other office supplies" });
    this.createCategory({ name: "Electronics", description: "Computers, phones, and other electronic devices" });
    this.createCategory({ name: "Furniture", description: "Office furniture and fixtures" });
    this.createCategory({ name: "Packaging", description: "Boxes, tape, and other packaging materials" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure all required fields have values
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "shop_owner",
      companyName: insertUser.companyName || null 
    };
    this.usersData.set(id, user);
    return user;
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsData.get(id);
  }
  
  async getProducts(userId: number): Promise<Product[]> {
    return Array.from(this.productsData.values()).filter(
      (product) => product.userId === userId,
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: new Date(),
      description: product.description || null,
      quantity: product.quantity || 0,
      isListed: product.isListed || false
    };
    this.productsData.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.productsData.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.productsData.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.productsData.delete(id);
  }
  
  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesData.get(id);
  }
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categoriesData.values());
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      description: category.description || null 
    };
    this.categoriesData.set(id, newCategory);
    return newCategory;
  }
  
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersData.get(id);
  }
  
  async getCustomers(userId: number): Promise<Customer[]> {
    return Array.from(this.customersData.values()).filter(
      (customer) => customer.userId === userId,
    );
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const newCustomer: Customer = { 
      ...customer, 
      id, 
      createdAt: new Date(),
      email: customer.email || null,
      phone: customer.phone || null,
      address: customer.address || null,
      isActive: customer.isActive ?? true
    };
    this.customersData.set(id, newCustomer);
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customersData.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = { ...existingCustomer, ...customer };
    this.customersData.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customersData.delete(id);
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersData.get(id);
  }
  
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.ordersData.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      orderDate: new Date(),
      status: order.status || "pending"
    };
    this.ordersData.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.ordersData.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.ordersData.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItemsData.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItemsData.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Invoice methods
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoicesData.get(id);
  }
  
  async getInvoiceByOrderId(orderId: number): Promise<Invoice | undefined> {
    return Array.from(this.invoicesData.values()).find(
      (invoice) => invoice.orderId === orderId,
    );
  }
  
  async getInvoices(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoicesData.values()).filter(
      (invoice) => invoice.userId === userId,
    );
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const newInvoice: Invoice = { 
      ...invoice, 
      id, 
      createdAt: new Date(),
      status: invoice.status || "unpaid"
    };
    this.invoicesData.set(id, newInvoice);
    return newInvoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const existingInvoice = this.invoicesData.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice = { ...existingInvoice, status };
    this.invoicesData.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  // Marketplace listing methods
  async getListing(id: number): Promise<MarketplaceListing | undefined> {
    return this.marketplaceListingsData.get(id);
  }
  
  async getListings(): Promise<MarketplaceListing[]> {
    return Array.from(this.marketplaceListingsData.values()).filter(
      (listing) => listing.isActive,
    );
  }
  
  async getVendorListings(vendorId: number): Promise<MarketplaceListing[]> {
    return Array.from(this.marketplaceListingsData.values()).filter(
      (listing) => listing.vendorId === vendorId,
    );
  }
  
  async createListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const id = this.listingId++;
    const newListing: MarketplaceListing = { 
      ...listing, 
      id, 
      createdAt: new Date(),
      isActive: listing.isActive ?? true,
      minOrderQuantity: listing.minOrderQuantity || 1
    };
    this.marketplaceListingsData.set(id, newListing);
    return newListing;
  }
  
  async updateListing(id: number, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const existingListing = this.marketplaceListingsData.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { ...existingListing, ...listing };
    this.marketplaceListingsData.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteListing(id: number): Promise<boolean> {
    return this.marketplaceListingsData.delete(id);
  }
}

export const storage = new MemStorage();
