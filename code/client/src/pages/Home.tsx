import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Truck, ShieldCheck, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: products, isLoading } = useProducts();

  // Featured Categories
  const categories = [
    { name: "Electronics", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&q=80", color: "bg-blue-100 text-blue-800" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", color: "bg-pink-100 text-pink-800" },
    { name: "Home", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80", color: "bg-green-100 text-green-800" },
    { name: "Books", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80", color: "bg-amber-100 text-amber-800" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-muted/30 pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Discover Quality <br/>
              <span className="text-primary">Without Compromise</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Shop the latest trends in electronics, fashion, and home decor. 
              Curated collections for the modern lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              <Link href="/products">
                <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base bg-background/50 backdrop-blur-sm">
                  View Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-bl from-primary/10 to-secondary/10 blur-3xl rounded-full opacity-60 translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-2/3 bg-gradient-to-tr from-secondary/10 to-primary/5 blur-3xl rounded-full opacity-60 -translate-x-1/4 translate-y-1/4" />
      </section>

      {/* Features Grid */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fast Delivery</h3>
                <p className="text-muted-foreground text-sm">Free shipping on orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Payment</h3>
                <p className="text-muted-foreground text-sm">100% secure payment processing</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
              <div className="p-3 rounded-full bg-accent text-accent-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-muted-foreground text-sm">Dedicated support anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Shop by Category</h2>
              <p className="text-muted-foreground">Browse our curated collections</p>
            </div>
            <Link href="/categories" className="text-primary hover:text-primary/80 font-medium hidden md:flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/products?category=${cat.name}`}>
                <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Unsplash image for category */}
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-bold text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{cat.name}</h3>
                    <div className="flex items-center text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Trending Now</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular products based on sales. Updated hourly.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button size="lg" variant="outline" className="min-w-[200px] rounded-full">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
