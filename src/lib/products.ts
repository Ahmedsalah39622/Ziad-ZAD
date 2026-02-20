export type Product = {
    id: string;
    name: string;
    price: number;
    priceDisplay: string;
    image: string;
    tag?: string;
    colors: { name: string; hex: string }[];
    sizes: string[];
    description: string;
    details: string[];
    category: string;
};

export const products: Product[] = [
    {
        id: "1",
        name: "ZAD Genesis 001",
        price: 599,
        priceDisplay: "L.E 599",
        image: "/zad_green_shirt_studio.png",
        tag: "Best Seller",
        colors: [
            { name: "Black", hex: "#000" },
            { name: "White", hex: "#fff" },
            { name: "Forest", hex: "#1a472a" },
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        description: "The flagship piece of Collection 001. Engineered with premium heavyweight cotton and nanobana fiber technology for a fit that moves with you.",
        details: [
            "300 GSM heavyweight cotton",
            "Nanobana fiber-infused fabric",
            "Relaxed oversized fit",
            "Ribbed cuffs and hem",
            "Screen-printed ZAD branding",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "2",
        name: "Nano-Weave Tee",
        price: 420,
        priceDisplay: "L.E 420",
        image: "",
        tag: "New",
        colors: [
            { name: "Carbon", hex: "#555" },
            { name: "Black", hex: "#000" },
        ],
        sizes: ["S", "M", "L", "XL"],
        description: "Ultra-lightweight nano-weave construction for breathable all-day comfort. The perfect base layer for any streetwear stack.",
        details: [
            "180 GSM nano-weave cotton",
            "Moisture-wicking technology",
            "Slim-relaxed fit",
            "Reinforced shoulder seams",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "3",
        name: "Holo-Shell Jacket",
        price: 1250,
        priceDisplay: "L.E 1,250",
        image: "",
        colors: [{ name: "Shadow", hex: "#111" }],
        sizes: ["S", "M", "L", "XL"],
        description: "A statement outerwear piece with a reflective inner shell that catches light in motion. Windproof and water-resistant.",
        details: [
            "Reflective holographic inner lining",
            "Water-resistant outer shell",
            "YKK zippers throughout",
            "Adjustable hem and cuffs",
            "Hidden interior pocket",
        ],
        category: "Outerwear",
    },
    {
        id: "4",
        name: "Structure Pant",
        price: 699,
        priceDisplay: "L.E 699",
        image: "",
        colors: [
            { name: "Black", hex: "#000" },
            { name: "Charcoal", hex: "#2b2b2b" },
        ],
        sizes: ["28", "30", "32", "34", "36"],
        description: "Articulated knee panels and a tapered silhouette designed for unrestricted movement. Utility meets style.",
        details: [
            "Stretch-woven twill fabric",
            "Articulated knee construction",
            "6-pocket utility design",
            "Tapered leg with zip ankle",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "5",
        name: "ZAD Oversize Hoodie",
        price: 799,
        priceDisplay: "L.E 799",
        image: "/zad_green_shirt_studio.png",
        tag: "Limited",
        colors: [
            { name: "White", hex: "#ffffff" },
            { name: "Black", hex: "#000000" },
        ],
        sizes: ["M", "L", "XL", "XXL"],
        description: "Heavy-duty oversized hoodie with a dropped shoulder and kangaroo pocket. The ZAD staple for cold-weather layering.",
        details: [
            "400 GSM heavyweight fleece",
            "Oversized dropped-shoulder fit",
            "Double-layered hood",
            "Embroidered ZAD logo",
            "Kangaroo pocket",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "6",
        name: "Tech Runner V2",
        price: 480,
        priceDisplay: "L.E 480",
        image: "",
        colors: [
            { name: "Blaze", hex: "#ff4400" },
            { name: "Stealth", hex: "#000" },
        ],
        sizes: ["S", "M", "L", "XL"],
        description: "Lightweight performance tee with built-in ventilation zones. Designed for runners who want to look good doing it.",
        details: [
            "Micro-mesh ventilation panels",
            "Quick-dry polyester blend",
            "Reflective logo detailing",
            "Athletic fit",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "7",
        name: "Cyber Tank",
        price: 320,
        priceDisplay: "L.E 320",
        image: "",
        colors: [{ name: "Grey", hex: "#888" }],
        sizes: ["S", "M", "L", "XL"],
        description: "Minimalist tank top with raw-cut edges and a curved hem. Summer essentials, ZAD style.",
        details: [
            "200 GSM cotton jersey",
            "Raw-cut armholes",
            "Curved dropped hem",
            "Tonal ZAD branding",
        ],
        category: "Men's Streetwear",
    },
    {
        id: "8",
        name: "Protocol Hat",
        price: 220,
        priceDisplay: "L.E 220",
        image: "",
        colors: [{ name: "Black", hex: "#000" }],
        sizes: ["One Size"],
        description: "Structured unisex cap with an embossed ZAD logo on the front. Adjustable strap for the perfect fit.",
        details: [
            "Structured 6-panel construction",
            "Embossed metal ZAD logo",
            "Adjustable metal buckle strap",
            "Ventilation eyelets",
        ],
        category: "Accessories",
    },
];

export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
}
