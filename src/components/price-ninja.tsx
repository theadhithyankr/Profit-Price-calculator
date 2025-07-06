
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAiSuggestionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Boxes,
  Calculator,
  CircleDollarSign,
  FileText,
  Loader2,
  Package,
  Percent,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const formSchema = z.object({
  productDescription: z.string().min(10, { message: "Please provide a more detailed product description." }).default("A high-quality custom t-shirt."),
  basePrice: z.coerce.number({invalid_type_error: "Please enter a valid number."}).min(0).default(280),
  packagingCost: z.coerce.number({invalid_type_error: "Please enter a valid number."}).min(0).default(30),
  deliveryCharge: z.coerce.number({invalid_type_error: "Please enter a valid number."}).min(0).default(80),
  numberOfProducts: z.coerce.number({invalid_type_error: "Please enter a valid number."}).int().min(1).default(1),
  desiredProfit: z.coerce.number({invalid_type_error: "Please enter a valid number."}).min(0).default(150),
  razorpayFee: z.coerce.number({invalid_type_error: "Please enter a valid number."}).min(0).max(100).default(2),
});

type FormValues = z.infer<typeof formSchema>;

const chartConfig = {
  basePrice: { label: "Base Price", color: "hsl(var(--chart-1))" },
  packagingCost: { label: "Packaging Cost", color: "hsl(var(--chart-2))" },
  deliveryCharge: { label: "Delivery Charge", color: "hsl(var(--chart-3))" },
  gatewayFee: { label: "Payment Gateway Fee", color: "hsl(var(--chart-4))" },
  profit: { label: "Profit", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


export function PriceNinja() {
  const [sellingPrice, setSellingPrice] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formSchema.parse({}),
    mode: "onChange",
  });

  const onCalculate = (data: FormValues) => {
    const { desiredProfit, numberOfProducts, basePrice, packagingCost, deliveryCharge, razorpayFee } = data;
    const totalCost = numberOfProducts * (basePrice + packagingCost + deliveryCharge);
    const priceBeforeFee = desiredProfit + totalCost;
    const finalPrice = priceBeforeFee / (1 - razorpayFee / 100);
    setSellingPrice(finalPrice);

    const gatewayFeeValue = finalPrice * (razorpayFee / 100);
    const newChartData = [
      { component: "basePrice", value: numberOfProducts * basePrice, fill: "var(--color-basePrice)" },
      { component: "packagingCost", value: numberOfProducts * packagingCost, fill: "var(--color-packagingCost)" },
      { component: "deliveryCharge", value: numberOfProducts * deliveryCharge, fill: "var(--color-deliveryCharge)" },
      { component: "gatewayFee", value: gatewayFeeValue, fill: "var(--color-gatewayFee)" },
      { component: "profit", value: desiredProfit, fill: "var(--color-profit)" },
    ].filter((d) => d.value > 0);
    setChartData(newChartData);
  };

  const handleAiSuggestion = async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      toast({
        variant: "destructive",
        title: "Invalid Form",
        description: "Please fill out the form correctly before getting a suggestion.",
      });
      return;
    }

    setIsLoadingAi(true);
    setAiSuggestion(null);

    const formData = form.getValues();
    const result = await getAiSuggestionAction(formData);

    if (result.success) {
      setAiSuggestion(result.suggestion);
    } else {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: result.error,
      });
    }

    setIsLoadingAi(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight">
            Endracle Pricing calculator
          </h1>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Price Calculator</CardTitle>
                <CardDescription>
                  Enter your product costs and desired profit to find the ideal selling price.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCalculate)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="productDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><FileText size={16}/> Product Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., A premium, 100% cotton t-shirt with a custom design."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><CircleDollarSign size={16}/> Base Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="280" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="packagingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Package size={16}/> Packaging Cost (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="deliveryCharge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Truck size={16}/> Delivery Charge (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="80" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        <FormField
                            control={form.control}
                            name="numberOfProducts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Boxes size={16}/> No. of Products</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                    </div>
                     <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="desiredProfit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><TrendingUp size={16}/> Desired Profit (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="150" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                         <FormField
                            control={form.control}
                            name="razorpayFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Percent size={16}/> Payment Gateway Fee (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="2" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                      <Calculator className="mr-2 h-5 w-5" /> Calculate Selling Price
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="sticky top-8 shadow-md">
              <CardHeader>
                <CardTitle className="text-accent text-2xl">Required Selling Price</CardTitle>
                 <CardDescription>The price you need to sell at to meet your profit goal.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                {sellingPrice !== null ? (
                   <p key={sellingPrice} className="text-6xl font-bold font-mono text-primary animate-in fade-in-0 zoom-in-95 duration-500">
                    ₹{sellingPrice.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-2xl text-muted-foreground">Enter details on the left</p>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2">
                <h3 className="text-md font-semibold text-muted-foreground">Spreadsheet Formula Version</h3>
                <code className="text-sm bg-muted text-muted-foreground p-3 rounded-md w-full break-all">
                  =(Profit + NumProducts*(BasePrice + PkgCost + DelCharge)) / (1 - Fee%/100)
                </code>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
                <CardDescription>A visual breakdown of your selling price.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {sellingPrice !== null && chartData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[250px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                          formatter={(value) => `₹${Number(value).toFixed(2)}`}
                          hideLabel
                        />}
                      />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="component"
                        innerRadius={60}
                        strokeWidth={2}
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="component" />}
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <p>Calculate a price to see the breakdown.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><Sparkles className="text-accent"/> AI Pricing Insights</CardTitle>
                    <CardDescription>Get a pricing strategy suggestion based on your product details and market trends.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleAiSuggestion} disabled={isLoadingAi} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base" size="lg">
                        {isLoadingAi ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                        Get AI Suggestion
                    </Button>
                    {aiSuggestion && (
                      <div className="mt-6 border-t pt-4 animate-in fade-in-0 duration-500">
                         <p className="text-sm text-foreground whitespace-pre-wrap">{aiSuggestion}</p>
                      </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-center px-4">
              <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground text-left max-w-md mx-auto">
                <p>"Don’t just sell. Control the numbers like a silent assassin. This formula is your pricing katana — use it to cut through the noise."</p>
                <cite className="font-bold mt-2 not-italic block text-right">- Batman</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
