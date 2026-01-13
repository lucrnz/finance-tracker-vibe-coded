import { Link } from 'react-router-dom';
import { 
  Wallet, 
  PieChart, 
  TrendingUp, 
  Shield, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: PieChart,
    title: 'Track Expenses',
    description: 'Categorize and monitor your spending habits with intuitive charts and reports.',
  },
  {
    icon: TrendingUp,
    title: 'Set Budgets',
    description: 'Create monthly budgets for each category and track your progress in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and securely stored. Only you have access.',
  },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">FinanceTracker</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Take Control of Your{' '}
          <span className="text-primary">Finances</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
          Track your income and expenses, set budgets, and gain insights into your 
          spending habits with our easy-to-use personal finance tracker.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need to Manage Your Money
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Start Your Financial Journey?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of users who have taken control of their finances.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FinanceTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}