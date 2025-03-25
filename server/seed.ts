import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { 
  type InsertUser, 
  type InsertProduct, 
  type InsertCategory,
  type InsertCustomer,
  type InsertOrder,
  type InsertOrderItem,
  type InsertInvoice,
  type InsertMarketplaceListing
} from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Seeds the database with initial data
 */
export async function seedDatabase() {
  console.log("Seeding database...");
  
  // Check if database has been seeded already
  const adminUser = await storage.getUserByUsername("admin");
  if (adminUser) {
    console.log("Database already seeded. Skipping...");
    return;
  }
  
  try {
    // Create users
    const shopOwner = await storage.createUser({
      username: "shopowner",
      password: await hashPassword("password123"),
      fullName: "John Smith",
      email: "john@example.com",
      role: "shop_owner",
      companyName: "Smith's Hardware"
    });
    
    const vendor1 = await storage.createUser({
      username: "vendor1",
      password: await hashPassword("password123"),
      fullName: "Alice Johnson",
      email: "alice@example.com",
      role: "vendor",
      companyName: "Johnson Supplies"
    });
    
    const vendor2 = await storage.createUser({
      username: "vendor2",
      password: await hashPassword("password123"),
      fullName: "Bob Williams",
      email: "bob@example.com",
      role: "vendor",
      companyName: "Williams Manufacturing"
    });
    
    console.log("Created users:", shopOwner.id, vendor1.id, vendor2.id);
    
    // Add categories (already added in constructor)
    const categories = await storage.getCategories();
    console.log("Categories:", categories.map(c => c.name));
    
    // Add products for vendor1
    const v1product1 = await storage.createProduct({
      name: "Premium Hammer",
      description: "Heavy duty hammer for professional use",
      sku: "HAM-PRO-001",
      price: "24.99",
      quantity: 50,
      categoryId: categories[0].id, // Office Supplies
      userId: vendor1.id,
      isListed: true
    });
    
    const v1product2 = await storage.createProduct({
      name: "Power Drill",
      description: "18V cordless drill with battery pack",
      sku: "DRILL-18V-002",
      price: "89.99",
      quantity: 30,
      categoryId: categories[1].id, // Electronics
      userId: vendor1.id,
      isListed: true
    });
    
    // Add products for vendor2
    const v2product1 = await storage.createProduct({
      name: "Office Desk",
      description: "Ergonomic office desk with adjustable height",
      sku: "DESK-ERG-001",
      price: "199.99",
      quantity: 15,
      categoryId: categories[2].id, // Furniture
      userId: vendor2.id,
      isListed: true
    });
    
    const v2product2 = await storage.createProduct({
      name: "Shipping Boxes (Pack of 10)",
      description: "Medium size cardboard boxes for shipping",
      sku: "BOX-MED-010",
      price: "12.99",
      quantity: 100,
      categoryId: categories[3].id, // Packaging
      userId: vendor2.id,
      isListed: true
    });
    
    console.log("Created products:", v1product1.id, v1product2.id, v2product1.id, v2product2.id);
    
    // Add customers for shop owner
    const customer1 = await storage.createCustomer({
      name: "Sarah Davis",
      email: "sarah@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      userId: shopOwner.id,
      isActive: true
    });
    
    const customer2 = await storage.createCustomer({
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "555-987-6543",
      address: "456 Oak Ave, Somecity, USA",
      userId: shopOwner.id,
      isActive: true
    });
    
    console.log("Created customers:", customer1.id, customer2.id);
    
    // Create marketplace listings
    const listing1 = await storage.createListing({
      productId: v1product1.id,
      vendorId: vendor1.id,
      price: "22.99", // Wholesale price lower than retail
      minOrderQuantity: 5,
      isActive: true
    });
    
    const listing2 = await storage.createListing({
      productId: v1product2.id,
      vendorId: vendor1.id,
      price: "79.99",
      minOrderQuantity: 3,
      isActive: true
    });
    
    const listing3 = await storage.createListing({
      productId: v2product1.id,
      vendorId: vendor2.id,
      price: "179.99",
      minOrderQuantity: 2,
      isActive: true
    });
    
    const listing4 = await storage.createListing({
      productId: v2product2.id,
      vendorId: vendor2.id,
      price: "10.99",
      minOrderQuantity: 10,
      isActive: true
    });
    
    console.log("Created marketplace listings:", listing1.id, listing2.id, listing3.id, listing4.id);
    
    // Create orders for shop owner
    const order1 = await storage.createOrder({
      orderNumber: "ORD-2023-001",
      customerId: customer1.id,
      userId: shopOwner.id,
      totalAmount: "245.96", // 2 power drills and 5 hammers
      status: "completed"
    });
    
    await storage.addOrderItem({
      orderId: order1.id,
      productId: v1product1.id,
      quantity: 5,
      unitPrice: "22.99"
    });
    
    await storage.addOrderItem({
      orderId: order1.id,
      productId: v1product2.id,
      quantity: 2,
      unitPrice: "79.99"
    });
    
    const order2 = await storage.createOrder({
      orderNumber: "ORD-2023-002",
      customerId: customer2.id,
      userId: shopOwner.id,
      totalAmount: "371.97", // 1 office desk and 10 shipping boxes
      status: "processing"
    });
    
    await storage.addOrderItem({
      orderId: order2.id,
      productId: v2product1.id,
      quantity: 1,
      unitPrice: "179.99"
    });
    
    await storage.addOrderItem({
      orderId: order2.id,
      productId: v2product2.id,
      quantity: 10,
      unitPrice: "10.99"
    });
    
    console.log("Created orders:", order1.id, order2.id);
    
    // Create invoices
    const invoice1 = await storage.createInvoice({
      invoiceNumber: "INV-2023-001",
      orderId: order1.id,
      userId: shopOwner.id,
      amount: "245.96",
      status: "paid",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    const invoice2 = await storage.createInvoice({
      invoiceNumber: "INV-2023-002",
      orderId: order2.id,
      userId: shopOwner.id,
      amount: "371.97",
      status: "unpaid",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    console.log("Created invoices:", invoice1.id, invoice2.id);
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}