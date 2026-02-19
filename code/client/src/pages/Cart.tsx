import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Cart() {
  const { data: cartItems, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const subtotal = cartItems?.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold">Sign in to view cart</h1>
        <p className="text-muted-foreground">Your items are waiting for you!</p>
        <Button onClick={() => window.location.href = "/api/login"}>Log In</Button>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (cartItems?.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Trash2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mb-4">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted/10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item) => (
              <div key={item.id} className="bg-card border border-border p-4 rounded-xl flex gap-4 items-center shadow-sm">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg bg-muted"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-1">{item.product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{item.product.category}</p>
                  <p className="font-bold text-primary">${Number(item.product.price).toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md"
                      onClick={() => {
                        if (item.quantity > 1) updateItem({ id: item.id, quantity: item.quantity - 1 });
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md"
                      onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg rounded-lg shadow-md shadow-primary/20" 
                onClick={() => setLocation("/checkout")}
              >
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Secure Checkout powered by Stripe (Mock)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
