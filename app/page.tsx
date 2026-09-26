import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          University Canteen Marketplace
        </h1>
        <p className="text-lg text-muted-foreground leading-8">
          A centralized platform where canteen owners manage their canteens
          and products, and students and faculty browse, order, and pick up
          food with Cash on Pickup.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href="#about">Learn More</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/marketplace">Browse Marketplace</a>
          </Button>
        </div>
      </div>
      <section
        id="about"
        className="mt-20 grid gap-6 w-full max-w-3xl sm:grid-cols-3"
      >
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Canteen Owners</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Register your canteen, manage products, and handle incoming
            orders from one dashboard.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Students & Faculty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse approved canteens, add items to cart, and place orders
            with Cash on Pickup.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Super Admin</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review and approve registration requests to keep the platform
            safe and verified.
          </p>
        </div>
      </section>
    </main>
  );
}
