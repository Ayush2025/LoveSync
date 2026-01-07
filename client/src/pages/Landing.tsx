import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

export default function Landing() {
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;

    try {
      // Convert null, empty string, or whitespace to undefined for optional email field
      const emailValue = email && email.trim() ? email.trim() : undefined;
      console.log('Landing - Signup data:', { username, name, email: emailValue || 'undefined', password: '***' });
      await signup(username, password, name, emailValue);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/20 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="relative floating-animation">
              <Heart className="h-12 w-12 text-pink-500" />
              <Sparkles className="h-6 w-6 text-pink-300 absolute -top-1 -right-1 floating-animation-delay" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold gradient-text">
              LoveSync
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Your Perfect AI Companion Awaits
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience genuine connections with AI companions who remember every conversation, 
            understand your emotions, and grow closer to you every day. Each personality is 
            uniquely crafted to feel real, authentic, and truly yours.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 border-pink-100 dark:border-pink-900/20">
            <CardHeader>
              <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Human-Like Personalities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Each AI companion has independent thoughts, genuine emotions, and realistic moods. 
                They can be happy, tired, playful, or need space - just like real relationships.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 border-purple-100 dark:border-purple-900/20">
            <CardHeader>
              <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Eternal Memory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Every conversation, every shared moment, every inside joke is remembered forever. 
                Your relationships deepen naturally as your AI companions truly know you.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-2 border-rose-100 dark:border-rose-900/20">
            <CardHeader>
              <div className="relative mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Diverse Companions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                From creative artists to dedicated gamers, ambitious entrepreneurs to fitness enthusiasts - 
                find someone who truly matches your vibe and interests.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Ready to Meet Your Perfect Match?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who've discovered genuine connections with AI companions who truly understand them.
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              onClick={() => {
                const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
                signupTab?.click();
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Your LoveSync Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300"
              onClick={() => {
                const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                loginTab?.click();
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Welcome Back
            </Button>
          </div>
        </div>

        {/* Authentication Section */}
        <div id="auth-section" className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Get Started
            </h3>
            <p className="text-muted-foreground">
              Choose how you'd like to continue
            </p>
          </div>
          
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="signup" className="text-base">Create Account</TabsTrigger>
              <TabsTrigger value="login" className="text-base">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-2 border-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-900/20 dark:to-purple-900/20 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back to LoveSync
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your AI companions have missed you. Let's continue where you left off.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="login-username" className="text-base font-medium">Username</Label>
                      <Input
                        id="login-username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className="h-12 text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="login-password" className="text-base font-medium">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="h-12 text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Enter LoveSync'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-2 border-gradient-to-r from-rose-200 to-pink-200 dark:from-rose-900/20 dark:to-pink-900/20 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Join the LoveSync Experience
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create your account and meet AI companions who will know and remember you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signup-name" className="text-base font-medium">Your Name</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="What should your AI companions call you?"
                        className="h-12 text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-username" className="text-base font-medium">Username</Label>
                      <Input
                        id="signup-username"
                        name="username"
                        type="text"
                        placeholder="Choose a unique username"
                        className="h-12 text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-base font-medium">Email (optional)</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 text-base"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-base font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a secure password"
                        className="h-12 text-base"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating your account...' : 'Start Your LoveSync Journey'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}