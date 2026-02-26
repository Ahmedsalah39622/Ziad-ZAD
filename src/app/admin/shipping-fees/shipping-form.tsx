"use client";

import { useState } from "react";
import { setSetting } from "@/lib/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";

export function ShippingForm({ initialFee }: { initialFee: string }) {
    const [fee, setFee] = useState(initialFee);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const floatVal = parseFloat(fee);
        if (isNaN(floatVal) || floatVal < 0) {
            toast.error("Please enter a valid positive number for shipping.");
            return;
        }

        setIsSaving(true);
        try {
            const result = await setSetting("global_shipping_fee", floatVal.toString());
            if (result.success) {
                toast.success("Shipping fee updated safely.");
            } else {
                toast.error(result.error || "Failed to save shipping fee.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-border bg-card text-foreground">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Global Shipping Configuration</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground/60">
                    Set the flat-rate shipping cost added to all customer orders. Set to 0 for Free Shipping.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="shipping-fee" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Flat Rate Shipping (L.E)
                        </label>
                        <Input
                            id="shipping-fee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            required
                            className="bg-foreground/5 border-border focus:border-border/50 text-foreground font-mono"
                            placeholder="e.g. 50"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold tracking-wider uppercase text-xs"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Shipping Rate
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
