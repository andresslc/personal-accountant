import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, TrendingUp, PieChart, AlertCircle, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FinFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition">
              Pricing
            </a>
            <a href="#trust" className="text-foreground/70 hover:text-foreground transition">
              Trust
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost">Log in</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign up</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
          Master Your Money with Clarity
        </h1>
        <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto text-balance">
          Track expenses, set budgets, and achieve financial freedom with our intuitive dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>

        {/* Dashboard Preview */}
        <div className="rounded-2xl border border-border bg-card p-1 shadow-xl overflow-hidden backdrop-blur">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 sm:p-12 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <p className="text-foreground/50 text-sm">Dashboard Preview Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need to manage your wealth</h2>
            <p className="text-lg text-foreground/70">Powerful tools designed for your financial success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Smart Tracking */}
            <Card className="p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Tracking</h3>
              <p className="text-foreground/70">
                Automatic categorization of your transactions. Just connect your accounts and we'll do the rest.
              </p>
            </Card>

            {/* Visual Reports */}
            <Card className="p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Visual Reports</h3>
              <p className="text-foreground/70">
                Beautiful charts and insights that help you understand your spending patterns at a glance.
              </p>
            </Card>

            {/* Budget Alerts */}
            <Card className="p-8 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Budget Alerts</h3>
              <p className="text-foreground/70">
                Get notified when you're approaching your budget limits. Stay in control of your spending.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="trust" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <p className="text-lg font-semibold text-foreground">Trusted by 10,000+ users worldwide</p>
            </div>
            <p className="text-foreground/70">Join thousands managing their finances with confidence</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-foreground/70">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="p-8 border border-border flex flex-col">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
              <p className="text-foreground/70 mb-6">Perfect to get started</p>
              <div className="text-4xl font-bold text-foreground mb-6">
                $0<span className="text-lg text-foreground/70">/mo</span>
              </div>
              <Button variant="outline" className="mb-8 bg-transparent">
                Get Started
              </Button>
              <div className="space-y-4 flex-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Track transactions</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Basic reports</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">1 account</span>
                </div>
              </div>
            </Card>

            {/* Pro Plan - Most Popular */}
            <Card className="p-8 border-2 border-primary flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
              <p className="text-foreground/70 mb-6">For serious money managers</p>
              <div className="text-4xl font-bold text-foreground mb-6">
                $9.99<span className="text-lg text-foreground/70">/mo</span>
              </div>
              <Button className="mb-8 bg-primary hover:bg-primary/90 text-primary-foreground">Start Free Trial</Button>
              <div className="space-y-4 flex-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Everything in Free</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Budget planning</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Advanced analytics</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Unlimited accounts</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Priority support</span>
                </div>
              </div>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 border border-border flex flex-col">
              <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
              <p className="text-foreground/70 mb-6">For organizations</p>
              <div className="text-4xl font-bold text-foreground mb-6">Custom</div>
              <Button variant="outline" className="mb-8 bg-transparent">
                Contact Sales
              </Button>
              <div className="space-y-4 flex-1">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Everything in Pro</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Team management</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Custom integrations</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground/70">Dedicated support</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">FinFlow</span>
              </div>
              <p className="text-foreground/70 text-sm">Master your money with clarity</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-foreground/70 text-sm">© 2025 FinFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-foreground/70 hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="text-foreground/70 hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
