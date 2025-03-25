import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceListing, Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, ShoppingCart, Package, Info, Tag, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface MarketplaceListingWithDetails extends MarketplaceListing {
  productName: string;
  productDescription: string;
  vendorName: string;
  categoryName: string;
}

export default function Marketplace() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingWithDetails | null>(null);
  const [newListing, setNewListing] = useState({
    productId: "",
    price: "",
    minOrderQuantity: "1",
  });

  // Fetch all marketplace listings
  const { data: allListings, isLoading: isLoadingAllListings } = useQuery<MarketplaceListingWithDetails[]>({
    queryKey: ["/api/marketplace"],
    select: (data) => {
      return data.map(listing => {
        const product = products?.find(p => p.id === listing.productId);
        const vendor = vendor || { username: "Unknown Vendor", fullName: "Unknown Vendor" };
        return {
          ...listing,
          productName: product?.name || "Unknown Product",
          productDescription: product?.description || "",
          vendorName: vendor.fullName,
          categoryName: "Unknown Category" // We'd need an API call to get this
        };
      });
    }
  });

  // Fetch vendor's own listings
  const { data: vendorListings, isLoading: isLoadingVendorListings } = useQuery<MarketplaceListingWithDetails[]>({
    queryKey: ["/api/marketplace/vendor"],
    enabled: user?.role === 'vendor',
    select: (data) => {
      return data.map(listing => {
        const product = products?.find(p => p.id === listing.productId);
        return {
          ...listing,
          productName: product?.name || "Unknown Product",
          productDescription: product?.description || "",
          vendorName: user?.fullName || "Your Company",
          categoryName: "Unknown Category"
        };
      });
    }
  });

  // Fetch products (for creating new listings)
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: user?.role === 'vendor'
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (listing: any) => {
      const res = await apiRequest("POST", "/api/marketplace", listing);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product listed in marketplace successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/vendor"] });
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

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/marketplace/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/vendor"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    const listingData = {
      productId: parseInt(newListing.productId),
      price: parseFloat(newListing.price),
      minOrderQuantity: parseInt(newListing.minOrderQuantity),
      isActive: true
    };
    
    createListingMutation.mutate(listingData);
  };

  const resetForm = () => {
    setNewListing({
      productId: "",
      price: "",
      minOrderQuantity: "1",
    });
  };

  const handleProductSelect = (productId: string) => {
    const product = products?.find(p => p.id === parseInt(productId));
    if (product) {
      setNewListing({
        ...newListing,
        productId,
        price: product.price.toString()
      });
    }
  };

  const placeholderListings = isLoadingAllListings ? Array(4).fill({}) : [];
  const isLoading = isLoadingAllListings || isLoadingVendorListings || isLoadingProducts;

  const filteredProducts = products?.filter(product => !product.isListed) || [];

  return (
    <div>
      <div className="py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">B2B Marketplace</h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.role === 'vendor' 
              ? "Manage your product listings and reach business customers" 
              : "Browse and order wholesale products from verified vendors"}
          </p>
        </div>
        
        {user?.role === 'vendor' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Marketplace Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddListing} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <select
                    id="product"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newListing.productId}
                    onChange={e => handleProductSelect(e.target.value)}
                    required
                  >
                    <option value="">Select a product</option>
                    {filteredProducts.map(product => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.name} - ${parseFloat(product.price.toString()).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      You don't have any unlisted products. Add products in the Products section first.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Wholesale Price</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={newListing.price} 
                      onChange={e => setNewListing({...newListing, price: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Minimum Order Quantity</Label>
                    <Input 
                      id="minQuantity" 
                      type="number" 
                      min="1" 
                      value={newListing.minOrderQuantity} 
                      onChange={e => setNewListing({...newListing, minOrderQuantity: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createListingMutation.isPending || filteredProducts.length === 0}
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Listing"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue={user?.role === 'vendor' ? "my-listings" : "browse"} className="space-y-4">
        <TabsList>
          {user?.role === 'vendor' && (
            <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          )}
          <TabsTrigger value="browse">Browse Marketplace</TabsTrigger>
        </TabsList>
        
        {user?.role === 'vendor' && (
          <TabsContent value="my-listings" className="space-y-4">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : vendorListings && vendorListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorListings.map(listing => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                      <h3 className="font-medium truncate">{listing.productName}</h3>
                      <Badge className={listing.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}>
                        {listing.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">${parseFloat(listing.price.toString()).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Min. Order</p>
                          <p className="font-medium">{listing.minOrderQuantity} units</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Listed Since</p>
                          <p className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateListingMutation.mutate({
                            id: listing.id,
                            data: { isActive: !listing.isActive }
                          })}
                          disabled={updateListingMutation.isPending}
                        >
                          {listing.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateListingMutation.mutate({
                            id: listing.id,
                            data: { price: parseFloat(prompt("Enter new price:", listing.price.toString()) || listing.price.toString()) }
                          })}
                          disabled={updateListingMutation.isPending}
                        >
                          Update Price
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Marketplace Listings</h3>
                  <p className="text-gray-500 mb-4">You haven't listed any products in the marketplace yet.</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
        
        <TabsContent value="browse" className="space-y-4">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allListings && allListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allListings.map(listing => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="p-4 bg-primary text-white">
                    <h3 className="font-medium truncate">{listing.productName}</h3>
                    <p className="text-xs text-white/80">Offered by {listing.vendorName}</p>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="details">
                        <AccordionTrigger className="text-sm">Product Details</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-gray-600 mb-2">{listing.productDescription || "No description available."}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Tag className="h-3 w-3" />
                            <span>{listing.categoryName}</span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Wholesale Price</p>
                        <p className="font-medium">${parseFloat(listing.price.toString()).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Min. Order</p>
                        <p className="font-medium">{listing.minOrderQuantity} units</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Marketplace Listings</h3>
                <p className="text-gray-500">There are no products available in the marketplace at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Product Details Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedListing?.productName}</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Product Description</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedListing.productDescription || "No description available."}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-medium">{selectedListing.vendorName}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedListing.categoryName}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${parseFloat(selectedListing.price.toString()).toFixed(2)}</p>
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-sm text-gray-500">Minimum Order</p>
                  <p className="font-medium">{selectedListing.minOrderQuantity} units</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedListing(null)}>
                  Close
                </Button>
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
