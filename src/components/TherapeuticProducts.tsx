import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ShoppingCart, Star, Package, Heart, Filter, ArrowLeft, Plus, Minus, Trash2, CreditCard, CheckCircle, PackageCheck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useProducts } from "./hooks/useData";
import { toast } from "sonner@2.0.3";
import { Order } from "./Orders";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  benefits: string[];
  ingredients?: string;
  usage?: string;
  inStock: boolean;
}

const categories = ['All', 'Supplements', 'Books', 'Journals', 'Aromatherapy', 'Meditation Tools'];

interface CartItem {
  productId: string;
  quantity: number;
}

interface TherapeuticProductsProps {
  onBack?: () => void;
}

export function TherapeuticProducts({ onBack }: TherapeuticProductsProps) {
  const { products, loading: productsLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    pinCode: '',
    state: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filter.toLowerCase()) ||
                         product.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    toast.success("Added to cart");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const isInCart = (productId: string) => cart.some(item => item.productId === productId);

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePayment = () => {
    // Create the new order
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      items: cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product ? product.price : 0
        };
      }),
      total: getTotalPrice(),
      status: 'Processing' as const,
      shippingInfo: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}${shippingInfo.address2 ? ', ' + shippingInfo.address2 : ''}`,
        city: shippingInfo.city,
        pinCode: shippingInfo.pinCode,
        state: shippingInfo.state
      }
    };

    // Save to localStorage
    const savedOrders = localStorage.getItem('mentara_orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(newOrder); // Add new order at the beginning
    localStorage.setItem('mentara_orders', JSON.stringify(orders));

    // Update state
    setLastOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
    
    // Reset shipping info
    setShippingInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      address2: '',
      city: '',
      pinCode: '',
      state: ''
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl">Therapeutic Products</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Wellness tools for your mental health journey</p>
              </div>
            </div>
            {/* Cart Button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {productsLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="w-full h-48 rounded-lg bg-muted animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </div>
              </Card>
            ))
          ) : (
            filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="fill-yellow-400 text-yellow-400" size={14} />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-lg font-semibold">₹{product.price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        {selectedProduct?.id === product.id && (
                          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{selectedProduct.name}</DialogTitle>
                              <DialogDescription>
                                View detailed information about this therapeutic product.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <ImageWithFallback
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              
                              <div>
                                <Badge>{selectedProduct.category}</Badge>
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                                    <span>{selectedProduct.rating}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    ({selectedProduct.reviews} reviews)
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedProduct.description}
                                </p>
                              </div>

                              {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                                <div>
                                  <h4 className="text-sm mb-2">Benefits</h4>
                                  <ul className="space-y-1">
                                    {selectedProduct.benefits.map((benefit, index) => (
                                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                                        <span className="text-primary mr-2">•</span>
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {selectedProduct.ingredients && (
                                <div>
                                  <h4 className="text-sm mb-2">Ingredients</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProduct.ingredients}
                                  </p>
                                </div>
                              )}

                              {selectedProduct.usage && (
                                <div>
                                  <h4 className="text-sm mb-2">How to Use</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedProduct.usage}
                                  </p>
                                </div>
                              )}

                              <div className="p-3 bg-accent rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="text-lg font-semibold">₹{selectedProduct.price}</span>
                                  {selectedProduct.inStock ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      In Stock
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">Out of Stock</Badge>
                                  )}
                                </div>
                              </div>

                              <Button
                                onClick={() => {
                                  if (isInCart(selectedProduct.id)) {
                                    removeFromCart(selectedProduct.id);
                                  } else {
                                    addToCart(selectedProduct.id);
                                  }
                                }}
                                className="w-full"
                                disabled={!selectedProduct.inStock}
                              >
                                {isInCart(selectedProduct.id) ? (
                                  <>Remove from Cart</>
                                ) : (
                                  <>
                                    <ShoppingCart size={16} className="mr-2" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (isInCart(product.id)) {
                            removeFromCart(product.id);
                          } else {
                            addToCart(product.id);
                          }
                        }}
                        disabled={!product.inStock}
                      >
                        {isInCart(product.id) ? (
                          'Remove'
                        ) : (
                          <>
                            <ShoppingCart size={14} className="mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {filteredProducts.length === 0 && !productsLoading && (
          <Card className="p-8 text-center">
            <Package className="mx-auto text-muted-foreground mb-3" size={48} />
            <h3 className="mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>
              Review and manage your cart items before checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto text-muted-foreground mb-3" size={48} />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <Card key={item.productId} className="p-3">
                      <div className="flex gap-3">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus size={12} />
                              </Button>
                              <span className="text-sm min-w-[2rem] text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus size={12} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">₹{product.price * item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total</span>
                    <span className="text-lg font-semibold">₹{getTotalPrice()}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="w-full">
                  <CreditCard size={16} className="mr-2" />
                  Proceed to Checkout
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order (demonstration mode - no actual payment will be processed).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Order Summary */}
            <div>
              <h4 className="text-sm mb-3">Order Summary</h4>
              <div className="space-y-2">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {product.name} x {item.quantity}
                      </span>
                      <span>₹{product.price * item.quantity}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-semibold">₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h4 className="text-sm mb-3">Shipping Information</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Full Name"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                />
                <Input
                  placeholder="Address Line 1"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                />
                <Input
                  placeholder="Address Line 2"
                  value={shippingInfo.address2}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  />
                  <Input
                    placeholder="PIN Code"
                    value={shippingInfo.pinCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, pinCode: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                />
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-sm mb-3">Payment Information (Demo)</h4>
              <div className="space-y-3">
                <Input placeholder="Card Number" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="MM/YY" />
                  <Input placeholder="CVV" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                This is a demonstration checkout. No actual payment will be processed.
              </p>
            </div>

            <Button onClick={handlePayment} className="w-full">
              <CreditCard size={16} className="mr-2" />
              Complete Payment (Demo)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Placed Successfully! 🎉</DialogTitle>
            <DialogDescription>
              Your order has been confirmed. Thank you for shopping with Mentara!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Success Icon */}
            <div className="flex justify-center py-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
            </div>

            {/* Order Number */}
            {lastOrder && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">#{lastOrder.orderNumber}</p>
              </div>
            )}

            {/* Order Summary */}
            <div>
              <h4 className="text-sm mb-3">Order Summary</h4>
              <div className="space-y-2">
                {lastOrder?.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {product.name} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-semibold">₹{lastOrder?.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div>
              <h4 className="text-sm mb-3">Shipping Address</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{lastOrder?.shippingInfo.name}</p>
                <p>{lastOrder?.shippingInfo.email}</p>
                <p>{lastOrder?.shippingInfo.phone}</p>
                <p className="pt-2">{lastOrder?.shippingInfo.address}</p>
                <p>
                  {lastOrder?.shippingInfo.city}, {lastOrder?.shippingInfo.state} - {lastOrder?.shippingInfo.pinCode}
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200 text-center">
                ✓ Payment successful! You will receive a confirmation email shortly.
              </p>
            </div>

            <Button onClick={() => setIsSuccessOpen(false)} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}