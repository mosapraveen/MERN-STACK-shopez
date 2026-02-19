import { useRoute, useLocation } from "wouter";
import { useProduct, useReviews, useCreateReview } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, ShoppingCart, ArrowLeft, Truck, Shield, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  
  const { data: product, isLoading } = useProduct(id);
  const { data: reviews } = useReviews(id);
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();
  const { mutate: createReview, isPending: isReviewing } = useCreateReview();
  const { user } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Button onClick={() => setLocation("/products")}>Back to Products</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }
    addToCart({ productId: product.id, quantity: 1 });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createReview({ productId: product.id, rating, comment }, {
      onSuccess: () => {
        setComment("");
        setRating(5);
        toast({ title: "Review submitted!" });
      }
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb / Back */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => setLocation("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          
          {/* Image Gallery (Placeholder for single image now) */}
          <div className="bg-muted rounded-3xl overflow-hidden shadow-lg border border-border">
            <img 
              src={product.imageUrl || "https://placehold.co/800x600?text=Product+Image"} 
              alt={product.name}
              className="w-full h-full object-cover aspect-square"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
              {/* Fake Rating Summary */}
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="fill-current h-5 w-5" />
                <span className="text-foreground font-medium ml-1">4.8</span>
                <span className="text-muted-foreground text-sm ml-1">(124 reviews)</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="flex-1 rounded-xl h-14 text-lg shadow-lg shadow-primary/20"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2" />}
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1 rounded-xl h-14 text-lg">
                Save to Wishlist
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border">
              <div className="flex gap-3">
                <Truck className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-sm">Free Delivery</h4>
                  <p className="text-xs text-muted-foreground">Orders over $50</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-sm">2 Year Warranty</h4>
                  <p className="text-xs text-muted-foreground">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-display mb-8">Customer Reviews</h2>
          
          {/* Write Review Form */}
          {user ? (
            <div className="bg-card border border-border rounded-2xl p-6 mb-10 shadow-sm">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={cn(
                        "transition-all hover:scale-110",
                        rating >= star ? "text-amber-500" : "text-muted-foreground/30"
                      )}
                    >
                      <Star className={cn("h-6 w-6", rating >= star && "fill-current")} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Share your thoughts about this product..."
                  className="mb-4 bg-background"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isReviewing}>
                  {isReviewing ? "Submitting..." : "Post Review"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-2xl p-6 mb-10 text-center">
              <p className="text-muted-foreground mb-4">Please login to write a review.</p>
              <Button onClick={() => window.location.href = "/api/login"} variant="outline">Log In</Button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews?.length === 0 ? (
              <p className="text-center text-muted-foreground italic">No reviews yet. Be the first to review!</p>
            ) : (
              reviews?.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {review.user?.firstName?.[0] || "U"}
                      </div>
                      <span className="font-semibold">{review.user?.firstName || "User"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-500 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
