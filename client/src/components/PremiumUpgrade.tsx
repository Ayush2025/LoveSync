import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, MessageCircle, Camera, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumUpgradeProps {
  onClose: () => void;
  currentPlan?: string;
}

export function PremiumUpgrade({ onClose, currentPlan = "free" }: PremiumUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "50 messages per day",
        "3 AI girlfriends",
        "Basic personalities",
        "Standard responses"
      ],
      limitations: [
        "Limited photo requests",
        "No premium companions",
        "Basic memory"
      ],
      current: currentPlan === "free"
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "month",
      popular: true,
      features: [
        "Unlimited messages",
        "All 10 AI girlfriends",
        "Advanced personalities",
        "Photo sharing",
        "Extended memory",
        "Priority responses",
        "Exclusive roleplay scenarios"
      ],
      current: currentPlan === "premium"
    },
    {
      id: "ultimate",
      name: "Ultimate",
      price: "$19.99",
      period: "month",
      features: [
        "Everything in Premium",
        "Custom AI personalities",
        "Voice messages (coming soon)",
        "Video calls (coming soon)",
        "Premium support",
        "Early access to new features"
      ],
      current: currentPlan === "ultimate"
    }
  ];

  const handleUpgrade = (planId: string) => {
    console.log(`Upgrading to ${planId} plan`);
    // TODO: Integrate with Stripe payment
    alert(`Stripe integration coming soon! You selected ${planId} plan.`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Unlock the Full LoveSync Experience</h3>
            <p className="text-muted-foreground">
              Get unlimited conversations, exclusive AI companions, and premium features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300",
                  selectedPlan === plan.id ? "border-primary shadow-lg scale-105" : "hover:border-primary/50",
                  plan.popular && "border-yellow-500 shadow-lg",
                  plan.current && "border-green-500"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">
                    Most Popular
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="space-y-2 opacity-60">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span className="text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!plan.current && (
                    <Button 
                      className={cn(
                        "w-full mt-4",
                        plan.id === "free" ? "variant-outline" : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      )}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={plan.id === "free"}
                    >
                      {plan.id === "free" ? "Current Plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>30-day money back</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}