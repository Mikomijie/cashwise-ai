import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Shield, Target, AlertCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Financial Coaching</span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your Money. <br />
              <span className="gradient-text">Your Future.</span> <br />
              Your Coach.
            </h1>

            {/* Subheading */}
            <p className="mb-8 text-lg text-muted-foreground md:text-xl lg:text-2xl">
              Get personalized financial guidance designed specifically for young Africans. 
              Build wealth, save smarter, and plan your financial future with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/onboarding">
                <Button size="lg" className="h-12 w-full px-8 text-base font-semibold sm:w-auto md:h-14 md:px-10 md:text-lg">
                  Start Your Journey
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="h-12 w-full px-8 text-base font-semibold sm:w-auto md:h-14 md:px-10 md:text-lg">
                  <Target className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>Personalized Advice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              Why Choose <span className="text-primary">CashWise AI</span>?
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Smart Financial Planning</h3>
                <p className="text-muted-foreground">
                  Get personalized budgeting tips, savings strategies, and investment advice tailored to your goals.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Leverage advanced AI to understand your financial situation and receive actionable recommendations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Built for Africa</h3>
                <p className="text-muted-foreground">
                  Culturally relevant advice that understands the unique financial landscape of African markets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 CashWise AI. Empowering financial futures across Africa.</p>
        </div>
      </footer>
    </div>
  );
}
