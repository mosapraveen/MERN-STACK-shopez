import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart, useCreateOrder } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

// Simplified schema for checkout
const checkoutSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(3, "Zip code is required"),
  cardName: z.string().min(3, "Name on card is required"),
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(16),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format MM/YY"),
  cvc: z.string().min(3).max(4),
});

export default function Checkout() {
  const { data: cartItems } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      city: "",
      zip: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    }
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
    // Simulate payment processing
    setTimeout(() => {
      // Mock creating order items payload (In real app, backend handles this from cart)
      // Here we assume backend takes items from cart automatically upon order creation
      createOrder({
        address: `${data.address}, ${data.city} ${data.zip}`,
        status: "pending",
        // Note: userId and total are handled by backend or schema default
      }, {
        onSuccess: () => {
          setSuccess(true);
          toast({
            title: "Order Placed Successfully!",
            description: "Thank you for your purchase.",
          });
          setTimeout(() => setLocation("/dashboard"), 3000);
        }
      });
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-700">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. You will receive an email confirmation shortly.
        </p>
        <Button onClick={() => setLocation("/dashboard")}>View Order in Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted/10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Checkout Form */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6">Shipping & Payment</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shipping Address</h3>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="New York" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl><Input placeholder="10001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment Details (Mock)</h3>
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry (MM/YY)</FormLabel>
                          <FormControl><Input placeholder="12/25" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl><Input placeholder="123" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                  {isPending ? <><Loader2 className="mr-2 animate-spin" /> Processing...</> : `Pay $${total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary (Simplified) */}
          <div>
            <div className="bg-muted/50 p-6 rounded-xl sticky top-24">
              <h2 className="text-xl font-bold mb-6">Your Order</h2>
              <div className="space-y-4 mb-6">
                {cartItems?.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted-foreground/20 flex items-center justify-center font-bold text-xs">
                        x{item.quantity}
                      </div>
                      <span>{item.product.name}</span>
                    </div>
                    <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
