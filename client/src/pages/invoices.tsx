import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Invoice, Order } from "@shared/schema";
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
import { Loader2, PlusCircle, FileText, Printer, Send, Check, AlertCircle } from "lucide-react";

type InvoiceWithOrderNumber = Invoice & { orderNumber: string };

export default function Invoices() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    orderId: "",
    amount: "",
    dueDate: "",
    status: "unpaid",
  });

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<InvoiceWithOrderNumber[]>({
    queryKey: ["/api/invoices"],
    select: (data) => {
      return data.map(invoice => {
        const order = orders?.find(o => o.id === invoice.orderId);
        return {
          ...invoice,
          orderNumber: order?.orderNumber || "Unknown"
        };
      });
    }
  });

  // Fetch orders for creating new invoices
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoice: any) => {
      const res = await apiRequest("POST", "/api/invoices", invoice);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
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

  // Update invoice status mutation
  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/invoices/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceData = {
      orderId: parseInt(newInvoice.orderId),
      amount: parseFloat(newInvoice.amount),
      dueDate: new Date(newInvoice.dueDate),
      status: newInvoice.status
    };
    
    createInvoiceMutation.mutate(invoiceData);
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders?.find(o => o.id === parseInt(orderId));
    if (order) {
      // Set default due date to 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      setNewInvoice({
        ...newInvoice,
        orderId,
        amount: order.totalAmount.toString(),
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
  };

  const handleUpdateInvoiceStatus = (id: number, status: string) => {
    updateInvoiceStatusMutation.mutate({ id, status });
  };

  const resetForm = () => {
    setNewInvoice({
      orderId: "",
      amount: "",
      dueDate: "",
      status: "unpaid",
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Unpaid</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const isLoading = isLoadingInvoices || isLoadingOrders;

  return (
    <div>
      <div className="py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Invoices</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your billing and payment records</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddInvoice} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="order">Select Order</Label>
                <Select 
                  value={newInvoice.orderId} 
                  onValueChange={handleOrderSelect}
                  required
                >
                  <SelectTrigger id="order">
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders?.map(order => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        {order.orderNumber} - ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Invoice Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={newInvoice.amount} 
                  onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={newInvoice.dueDate} 
                  onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newInvoice.status} 
                  onValueChange={value => setNewInvoice({...newInvoice, status: value})}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createInvoiceMutation.isPending}
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
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
                <TableHead>Invoice Number</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices && invoices.length > 0 ? (
                invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.orderNumber}</TableCell>
                    <TableCell>${parseFloat(invoice.amount.toString()).toFixed(2)}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View/Print Invoice">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Send Invoice">
                          <Send className="h-4 w-4" />
                        </Button>
                        
                        {invoice.status === 'unpaid' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Mark as Paid"
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}
                            disabled={updateInvoiceStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        
                        {invoice.status === 'unpaid' && 
                         new Date(invoice.dueDate) < new Date() && 
                         invoice.status !== 'overdue' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Mark as Overdue"
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, 'overdue')}
                            disabled={updateInvoiceStatusMutation.isPending}
                          >
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No invoices found. Create your first invoice to get started.
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
