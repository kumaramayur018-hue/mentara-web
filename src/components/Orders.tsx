import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Package, ArrowLeft, Calendar, CreditCard, MapPin, ShoppingBag, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useProducts } from "./hooks/useData";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pinCode: string;
    state: string;
  };
}

interface OrdersProps {
  onBack?: () => void;
  onNavigateToProducts?: () => void;
}

export function Orders({ onBack, onNavigateToProducts }: OrdersProps) {
  const { products } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('mentara_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1>My Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingBag className="mx-auto text-muted-foreground mb-3" size={48} />
          <h3 className="mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't placed any orders yet. Start shopping for therapeutic products!
          </p>
          {onNavigateToProducts && (
            <Button onClick={onNavigateToProducts}>
              Browse Products
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Order Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm">Order #{order.orderNumber}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                {/* Order Items Preview */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {order.items.slice(0, 3).map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={item.productId} className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        {item.quantity > 1 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.quantity}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">₹{order.total}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    {selectedOrder?.id === order.id && (
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>
                            Complete information about order #{selectedOrder.orderNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Order Status */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge className={getStatusColor(selectedOrder.status)}>
                              {selectedOrder.status}
                            </Badge>
                          </div>

                          {/* Order Date */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Order Date</span>
                            <span className="text-sm">{formatDate(selectedOrder.date)}</span>
                          </div>

                          {/* Items List */}
                          <div>
                            <h4 className="text-sm mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {selectedOrder.items.map((item) => {
                                const product = getProductById(item.productId);
                                if (!product) return null;
                                
                                return (
                                  <div key={item.productId} className="flex gap-3 p-2 rounded border">
                                    <ImageWithFallback
                                      src={product.image}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <h5 className="text-sm">{product.name}</h5>
                                      <p className="text-xs text-muted-foreground">{product.category}</p>
                                      <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-muted-foreground">
                                          Qty: {item.quantity}
                                        </span>
                                        <span className="text-sm font-semibold">
                                          ₹{item.price * item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Shipping Information */}
                          <div>
                            <h4 className="text-sm mb-3 flex items-center gap-2">
                              <MapPin size={14} />
                              Shipping Address
                            </h4>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p>{selectedOrder.shippingInfo.name}</p>
                              <p>{selectedOrder.shippingInfo.address}</p>
                              <p>
                                {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.pinCode}
                              </p>
                              <p className="pt-2 border-t">
                                Phone: {selectedOrder.shippingInfo.phone}
                              </p>
                              <p>Email: {selectedOrder.shippingInfo.email}</p>
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="border-t pt-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{selectedOrder.total}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600">Free</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span>Total Paid</span>
                                <span className="text-lg font-semibold">₹{selectedOrder.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}