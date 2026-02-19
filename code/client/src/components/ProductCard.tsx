import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    addToCart({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Image Container */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
           {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          
          <img
            src={product.imageUrl || "https://placehold.co/600x400?text=No+Image"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Quick Add Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isPending}
            size="icon"
            className="absolute bottom-3 right-3 z-20 translate-y-12 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 bg-white text-foreground hover:bg-primary hover:text-white rounded-full"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>
              <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <p className="text-lg font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
