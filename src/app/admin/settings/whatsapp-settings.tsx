"use client";

import { useState } from "react";
import { setSetting } from "@/lib/actions/settings-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";

export function WhatsAppSettings({ initialNumber }: { initialNumber: string }) {
    const [number, setNumber] = useState(initialNumber);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Basic validation - check if it has only numbers and optional plus sign
            if (number && !/^\+?[0-9]*$/.test(number.replace(/\s+/g, ""))) {
                toast.error("Please enter a valid phone number format.");
                setIsSaving(false);
                return;
            }

            // Remove spaces
            const cleanNumber = number.replace(/\s+/g, "");

            const result = await setSetting("whatsapp_number", cleanNumber);

            if (result.success) {
                toast.success("WhatsApp configuration has been updated successfully.");
            } else {
                throw new Error(result.error || "Failed to save settings");
            }
        } catch (error) {
            toast.error("There was a problem saving your WhatsApp configuration.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-border bg-card text-foreground md:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>WhatsApp Widget</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground/60">
                    Configure the floating WhatsApp contact button that appears on all customer-facing pages.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="whatsapp-number" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        Phone Number (with Country Code)
                    </Label>
                    <div className="flex flex-col gap-2">
                        <Input
                            id="whatsapp-number"
                            placeholder="e.g. +201001234567"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="bg-background border-border"
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            Leave completely blank to hide the widget. Include the country code without spaces or symbols (e.g., 20123456789).
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto font-bold uppercase tracking-wider text-xs"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Configuration"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
