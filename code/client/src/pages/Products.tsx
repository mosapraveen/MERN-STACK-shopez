import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Books", "Toys"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Debounce search could be added here for optimization
  const { data: products, isLoading, error } = useProducts(search, activeCategory);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-12 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold mb-4">All Products</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our vast collection of premium items. Filter by category or search to find exactly what you need.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          
          {/* Sidebar Filters (Desktop) / Horizontal Scroll (Mobile) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Categories
                </h3>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start whitespace-nowrap",
                        activeCategory === cat ? "bg-secondary/10 text-secondary hover:bg-secondary/20" : ""
                      )}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-500 font-medium">Failed to load products.</p>
                <Button variant="link" onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-lg mb-2">No products found</p>
                <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSearch(""); setActiveCategory("All"); }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
