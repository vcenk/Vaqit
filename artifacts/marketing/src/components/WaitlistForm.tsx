import { useState, useRef, useEffect } from "react";
import { useJoinWaitlist, useGetWaitlistCount, getGetWaitlistCountQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const queryClient = useQueryClient();
  
  const { data: countData } = useGetWaitlistCount();
  const joinMutation = useJoinWaitlist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    joinMutation.mutate({ data: { email, city: city || undefined } }, {
      onSuccess: () => {
        toast.success("You're on the list. We'll be in touch soon.");
        setEmail("");
        setCity("");
        queryClient.invalidateQueries({ queryKey: getGetWaitlistCountQueryKey() });
      },
      onError: (error) => {
        toast.error(error?.message || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto" id="waitlist">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-4">
          The last prayer app you'll ever need.
        </h2>
        <p className="text-muted-foreground text-lg">
          Join {countData?.count ? <span className="text-accent font-medium">{countData.count}</span> : "the"} others waiting for a better standard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border border-card-border shadow-lg">
        <div className="space-y-2 text-left">
          <Label htmlFor="email">Email address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={joinMutation.isPending}
            className="bg-background"
          />
        </div>
        
        <div className="space-y-2 text-left">
          <Label htmlFor="city">City <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <Input 
            id="city" 
            type="text" 
            placeholder="London, Vancouver, etc." 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={joinMutation.isPending}
            className="bg-background"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full text-base py-6 mt-2" 
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>Join the Waitlist <ArrowRight className="ml-2 h-5 w-5" /></>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground pt-2">
          We don't spam. We'll only email you when we launch.
        </p>
      </form>
    </div>
  );
}
