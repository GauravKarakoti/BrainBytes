"use client";

import { PricingPlans } from "@/components/pricing/PricingPlans";
import { Crown, Star, Users, Zap, Shield, CheckCircle } from "lucide-react";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/20 p-4 rounded-full">
                <Crown className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Unlock Your <span className="text-primary">Coding Potential</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of developers who have accelerated their careers with premium features,
              expert mentoring, and exclusive content.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>10,000+ Premium Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <PricingPlans />

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Premium?</h2>
          <p className="text-lg text-muted-foreground">
            Get access to exclusive features designed to accelerate your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Unlimited Hearts</h3>
            <p className="text-muted-foreground">
              Practice without limits. Get unlimited hearts to tackle challenges and improve your skills.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Mentoring</h3>
            <p className="text-muted-foreground">
              Get personalized guidance from experienced developers. Schedule 1-on-1 sessions.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Code Reviews</h3>
            <p className="text-muted-foreground">
              Get detailed feedback on your code from senior developers. Improve faster.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Track your progress with detailed analytics and AI-powered insights.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">VIP Tournaments</h3>
            <p className="text-muted-foreground">
              Compete in exclusive coding tournaments with premium prizes and recognition.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
            <p className="text-muted-foreground">
              Get help when you need it most with 24/7 dedicated support from our team.
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-card border border-border rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">What Our Premium Members Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The live mentoring sessions completely changed how I approach coding problems.
                My mentor helped me land my dream job!"
              </p>
              <p className="font-semibold">Sarah Chen</p>
              <p className="text-sm text-muted-foreground">Software Engineer at Google</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Unlimited hearts let me practice consistently. I went from struggling with
                algorithms to solving LeetCode hards regularly."
              </p>
              <p className="font-semibold">Mike Rodriguez</p>
              <p className="text-sm text-muted-foreground">Full Stack Developer</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The code reviews are incredible. Each review comes with detailed explanations
                and best practices that I use daily."
              </p>
              <p className="font-semibold">Emma Thompson</p>
              <p className="text-sm text-muted-foreground">Senior Developer at Meta</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll continue to have access
                to premium features until the end of your billing period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee. If you're not satisfied with your premium
                experience, contact our support team for a full refund.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Can I switch between monthly and yearly billing?</h4>
              <p className="text-muted-foreground">
                Absolutely! You can change your billing cycle in your subscription dashboard.
                The change will be prorated and reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, Mastercard, American Express) through Stripe,
                and cryptocurrency payments (ETH or BYTE tokens) on the Sepolia testnet.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Do you offer student discounts?</h4>
              <p className="text-muted-foreground">
                Yes! Students get 50% off all premium plans. Contact our support team with your
                student ID or university email for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
