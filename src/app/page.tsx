import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Shield, Clock, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">BuildProcure</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-slate-600 hover:text-slate-900">Features</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link href="/auth/signin" className="text-slate-600 hover:text-slate-900">Sign In</Link>
            <Link href="/auth/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Construction Procurement<br className="hidden md:block" />
              <span className="text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Streamline your procurement process with South Africa&apos;s most comprehensive 
              construction management platform. RFQs, POs, deliveries, and compliance — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">Start 14-Day Free Trial</Button>
              </Link>
              <Link href="/demo-request">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Request Demo</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>RFQ Management</CardTitle>
                  <CardDescription>
                    Create and send RFQs to multiple suppliers. Compare quotes side-by-side and award with one click.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Purchase Orders</CardTitle>
                  <CardDescription>
                    Generate professional POs from awarded RFQs. Track status from draft to delivery.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Delivery Scheduling</CardTitle>
                  <CardDescription>
                    Schedule and track deliveries. Log receipts, flag issues, and monitor supplier performance.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>CIDB Compliance</CardTitle>
                  <CardDescription>
                    Track contractor CIDB grading, BEE status, and compliance documents with automatic expiry alerts.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Contractor Management</CardTitle>
                  <CardDescription>
                    Manage all subcontractors per project. Track contract values, payments, and performance ratings.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Building2 className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Budget Tracking</CardTitle>
                  <CardDescription>
                    Real-time budget vs actual tracking per cost code. Get alerts at 80% and 100% variance.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>For small teams</CardDescription>
                  <div className="text-4xl font-bold mt-4">R1,999<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 1 active project</li>
                    <li>✓ Up to 3 users</li>
                    <li>✓ All core features</li>
                    <li>✓ Email support</li>
                  </ul>
                  <Button className="w-full mt-6">Start Trial</Button>
                </CardContent>
              </Card>
              <Card className="border-blue-600 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 text-xs rounded-full">
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                  <div className="text-4xl font-bold mt-4">R6,000<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Up to 10 active projects</li>
                    <li>✓ Up to 15 users</li>
                    <li>✓ Full dashboard</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <Button className="w-full mt-6">Start Trial</Button>
                </CardContent>
              </Card>
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organisations</CardDescription>
                  <div className="text-4xl font-bold mt-4">R15,000<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Unlimited projects</li>
                    <li>✓ Unlimited users</li>
                    <li>✓ Multi-company support</li>
                    <li>✓ Custom branding</li>
                  </ul>
                  <Button className="w-full mt-6">Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Operations?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join leading South African construction companies already using BuildProcure 
              to streamline their procurement and project operations.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-slate-900">BuildProcure</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2024 BuildProcure. Built for the South African construction industry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}