import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Link from "next/link";

function AccordionItemFAQs(props: React.ComponentProps<typeof AccordionItem>) {
  return (
    <AccordionItem
      {...props}
      className={cn(
        "bg-foreground/[0.04] data-[state=open]:bg-foreground/[0.08] data-[state=open]:border-foreground/10 rounded-lg border border-foreground/[0.06] px-5 py-2 transition-colors data-[state=open]:shadow-sm lg:px-7",
        props.className,
      )}
    />
  );
}

function AccordionTriggerFAQs(props: React.ComponentProps<typeof AccordionTrigger>) {
  return (
    <AccordionTrigger
      {...props}
      className={cn("[&[data-state=open]>svg]:text-foreground text-base lg:text-lg text-muted-foreground", props.className)}
    />
  );
}

function AccordionContentFAQs(props: React.ComponentProps<typeof AccordionContent>) {
  return <AccordionContent {...props} className={cn("text-muted-foreground/80 lg:text-base", props.className)} />;
}

export function FAQs() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-2 md:gap-14 md:px-10 md:py-25 bg-background text-foreground">
      <div className="flex w-full flex-col gap-6">
        <Badge variant="secondary" className="mb-2 uppercase bg-foreground/10 text-foreground border-foreground/10 hover:bg-foreground/15">
          FAQ
        </Badge>
        <h2 className="text-4xl leading-[0.9] font-black tracking-tighter uppercase sm:text-7xl">
          Frequently
          <br />
          Asked <span className="text-muted-foreground/60">Questions</span>
        </h2>
        <p className="max-w-lg text-xs leading-6 tracking-tight sm:text-base text-muted-foreground/80">
          Got questions? We&apos;ve got answers.
        </p>
        <Button className="w-fit bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold uppercase tracking-widest" size="lg" asChild>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
      <Accordion type="single" collapsible defaultValue="shipping" className="grid w-full gap-4">
        <AccordionItemFAQs value="shipping">
          <AccordionTriggerFAQs>How long does shipping take?</AccordionTriggerFAQs>
          <AccordionContentFAQs>
            <p>
              Orders within Egypt typically arrive in 3-5 business days. International orders take 7-14 business days depending on your location.
            </p>
          </AccordionContentFAQs>
        </AccordionItemFAQs>
        <AccordionItemFAQs value="returns">
          <AccordionTriggerFAQs>What is your return policy?</AccordionTriggerFAQs>
          <AccordionContentFAQs>
            <p>
              We offer a 30-day return policy. Items must be unworn and in original packaging. Contact us to start a return.
            </p>
          </AccordionContentFAQs>
        </AccordionItemFAQs>
        <AccordionItemFAQs value="sizing">
          <AccordionTriggerFAQs>How do I find my size?</AccordionTriggerFAQs>
          <AccordionContentFAQs>
            <p>Check our size guide on each product page. Our fits are designed to be true-to-size with a modern, relaxed silhouette.</p>
          </AccordionContentFAQs>
        </AccordionItemFAQs>
        <AccordionItemFAQs value="quality">
          <AccordionTriggerFAQs>What materials do you use?</AccordionTriggerFAQs>
          <AccordionContentFAQs>
            <p>We use premium heavyweight cotton, sustainable fabrics, and custom-milled textiles. Every piece is engineered for comfort and durability.</p>
          </AccordionContentFAQs>
        </AccordionItemFAQs>
      </Accordion>
    </div>
  );
}
