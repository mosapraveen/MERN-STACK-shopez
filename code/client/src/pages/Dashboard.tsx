import { useOrders } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Package, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (authLoading || ordersLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-muted/10">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName || 'User'}!</p>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg border border-border shadow-sm">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Orders</span>
            <p className="text-2xl font-bold text-primary">{orders?.length || 0}</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Order History</h2>
          
          {orders?.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            orders?.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Order #{order.id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt || "").toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      order.status === "pending" ? "bg-amber-100 text-amber-800" :
                      order.status === "processing" ? "bg-blue-100 text-blue-800" :
                      order.status === "delivered" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {order.status}
                    </span>
                    <p className="font-bold text-lg">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{order.address}</span>
                </div>
                
                {/* Normally we'd fetch items here, but kept simple for list view */}
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                   <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
