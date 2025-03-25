import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Order, Customer, Product } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, CheckCircle, XCircle } from "lucide-react";

type OrderWithCustomerName = Order & { customerName: string };

export default function Orders() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: string; unitPrice: string }[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    totalAmount: 0,
    status: "pending",
  });

  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<OrderWithCustomerName[]>({
    queryKey: ["/api/orders"],
    select: (data) => {
      // Map customer names to orders
      if (customers) {
        return data.map(order => ({
          ...order,
          customerName: customers.find(c => c.id === order.customerId)?.name || "Unknown Customer"
        }));
      }
      return data;
    }
  });

  // Fetch customers
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert and validate order items
    const items = orderItems.map(item => ({
      productId: parseInt(item.productId),
      quantity: parseInt(item.quantity),
      unitPrice: parseFloat(item.unitPrice)
    }));
    
    // Calculate total amount from items
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const orderData = {
      ...newOrder,
      customerId: parseInt(newOrder.customerId),
      totalAmount,
      items
    };
    
    createOrderMutation.mutate(orderData);
  };

  const handleUpdateOrderStatus = (id: number, status: string) => {
    updateOrderStatusMutation.mutate({ id, status });
  };

  const resetForm = () => {
    setNewOrder({
      customerId: "",
      totalAmount: 0,
      status: "pending",
    });
    setOrderItems([]);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: "1", unitPrice: "" }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: string) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If product is selected, set the default price
    if (field === 'productId' && products) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        updatedItems[index].unitPrice = product.price.toString();
      }
    }
    
    setOrderItems(updatedItems);
    
    // Calculate total order amount
    if (updatedItems.every(item => item.productId && item.quantity && item.unitPrice)) {
      const total = updatedItems.reduce((sum, item) => {
        return sum + (parseInt(item.quantity) * parseFloat(item.unitPrice));
      }, 0);
      setNewOrder({ ...newOrder, totalAmount: total });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingProducts;

  return (
    <div>
      <div className="py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your customer orders</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddOrder} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select 
                  value={newOrder.customerId} 
                  onValueChange={value => setNewOrder({...newOrder, customerId: value})}
                  required
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`product-${index}`}>Product</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={value => updateOrderItem(index, 'productId', value)}
                          required
                        >
                          <SelectTrigger id={`product-${index}`}>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - ${parseFloat(product.price.toString()).toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input 
                          id={`quantity-${index}`} 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={e => updateOrderItem(index, 'quantity', e.target.value)} 
                          required 
                        />
                      </div>
                      
                      <div className="w-32">
                        <Label htmlFor={`price-${index}`}>Unit Price</Label>
                        <Input 
                          id={`price-${index}`} 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={item.unitPrice} 
                          onChange={e => updateOrderItem(index, 'unitPrice', e.target.value)} 
                          required 
                        />
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => removeOrderItem(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addOrderItem}
                    className="w-full"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                  <span className="ml-2 text-lg font-bold">${newOrder.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOrderMutation.isPending || orderItems.length === 0}
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Order"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(order.totalAmount.toString()).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            Process
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            disabled={updateOrderStatusMutation.isPending}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            disabled={updateOrderStatusMutation.isPending}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No orders found. Create your first order to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
