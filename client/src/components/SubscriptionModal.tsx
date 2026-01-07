import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Heart, MessageCircle, Camera, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
}

export function SubscriptionModal({ open, onClose, onUpgrade }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");

  const plans = [
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "month",
      popular: true,
      features: [
        "Unlimited daily messages",
        "Access to all 10 AI girlfriends",
        "Photo sharing & requests",
        "Extended conversation memory",
        "Priority AI responses",
        "Exclusive roleplay scenarios",
        "Custom personality settings"
      ],
      savings: "Save 60% vs daily limits"
    },
    {
      id: "ultimate",
      name: "Ultimate",
      price: "$19.99",
      period: "month",
      features: [
        "Everything in Premium",
        "Early access to new companions",
        "Voice messages (coming soon)",
        "Video calls (coming soon)",
        "Custom AI personality creation",
        "Premium customer support",
        "No ads ever"
      ],
      savings: "Most popular choice"
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onUpgrade(planId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Unlock Premium Features
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground">
              Join thousands of users enjoying unlimited conversations with AI companions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:shadow-lg",
                  selectedPlan === plan.id ? "border-primary shadow-lg scale-105" : "",
                  plan.popular && "border-yellow-500"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">{plan.savings}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={cn(
                      "w-full mt-6 h-12 text-lg",
                      plan.id === selectedPlan 
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
                        : "variant-outline"
                    )}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "Selected Plan" : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}