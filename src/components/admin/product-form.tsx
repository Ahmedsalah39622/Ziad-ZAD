"use client";

import { useState } from "react";
import { Plus, Trash2, X, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createProduct, updateProduct } from "@/lib/actions/product-actions";
import { useRouter } from "next/navigation";
import { Category, Product } from "@prisma/client";

interface ProductFormProps {
    categories: Category[];
    initialData?: Partial<Product>;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice?.toString() || "");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [tag, setTag] = useState(initialData?.tag || "");

    const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

    // Dynamic Arrays - Handle JSON parsing if needed
    function parseJson<T>(raw: unknown, fallback: T): T {
        if (raw === undefined || raw === null) return fallback;
        if (typeof raw !== "string") return raw as T;
        try {
            return JSON.parse(raw) as T;
        } catch (e) {
            console.warn("Failed to parse JSON in ProductForm initial data", e);
            return fallback;
        }
    }
    const [colors, setColors] = useState<{ name: string; hex: string }[]>(
        initialData?.colors ? parseJson<{ name: string; hex: string }[]>(initialData.colors, []) : []
    );
    const [images, setImages] = useState<{ url: string; color?: string }[]>(
        initialData?.images ? parseJson<{ url: string; color?: string }[]>(initialData.images, []) : []
    );
    const [details, setDetails] = useState<string[]>(
        initialData?.details ? parseJson<string[]>(initialData.details, [""]) : [""]
    );

    // Sizes with stock: [{ name: "S", stock: 10 }, ...]
    const [sizes, setSizes] = useState<{ name: string; stock: number }[]>(() => {
        if (!initialData?.sizes) return [];
        const parsed = parseJson<unknown[]>(initialData.sizes, []);
        // Migration: If it's just a string array, convert to objects with current total stock
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return (parsed as string[]).map(s => ({ name: s, stock: initialData.stock || 0 }));
        }
        // If it's already array of objects, try to coerce
        if (Array.isArray(parsed)) {
            return (parsed as unknown[]).map(item => {
                if (item && typeof item === 'object') {
                    const rec = item as Record<string, unknown>;
                    return {
                        name: rec.name ? String(rec.name) : String(item),
                        stock: typeof rec.stock === 'number' ? (rec.stock as number) : Number(rec.stock ?? 0)
                    };
                }
                return { name: String(item), stock: initialData.stock || 0 };
            });
        }
        return [];
    });

    // Helpers
    const toggleSize = (sizeName: string) => {
        if (sizes.find(s => s.name === sizeName)) {
            setSizes(sizes.filter(s => s.name !== sizeName));
        } else {
            setSizes([...sizes, { name: sizeName, stock: 0 }]);
        }
    };

    const updateSizeStock = (sizeName: string, stockValue: number) => {
        setSizes(sizes.map(s => s.name === sizeName ? { ...s, stock: stockValue } : s));
    };

    // Auto-calculate total stock based on sizes
    const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

    const addColor = () => setColors([...colors, { name: "", hex: "#000000" }]);
    const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index));
    const updateColor = (index: number, field: "name" | "hex", value: string) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
    };

    const addImage = () => setImages([...images, { url: "", color: "" }]);
    const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));
    const updateImage = (index: number, field: "url" | "color", value: string) => {
        const newImages = [...images];
        newImages[index][field] = value;
        setImages(newImages);
    };

    const addDetail = () => setDetails([...details, ""]);
    const removeDetail = (index: number) => setDetails(details.filter((_, i) => i !== index));
    const updateDetail = (index: number, value: string) => {
        const newDetails = [...details];
        newDetails[index] = value;
        setDetails(newDetails);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const data = {
            name,
            price: parseFloat(price),
            compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
            description,
            details: details.filter(d => d.trim() !== ""),
            images,
            sizes, // Now objects [{name, stock}]
            colors: colors.filter(c => c.name.trim() !== ""),
            categoryId,
            stock: totalStock, // Use calculated total
            tag,
        };

        try {
            if (initialData?.id) {
                await updateProduct(initialData.id, data);
            } else {
                await createProduct({ payload: JSON.stringify(data) });
            }
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("Failed to save product:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3 pb-20">
            {/* Left Column - Core Info */}
            <div className="lg:col-span-2 space-y-8">
                {/* Basic Info */}
                <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-2xl">
                    <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Basic Information</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Product Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Genesis Hoodie"
                                required
                                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground h-12 focus:ring-foreground/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the soul of this product..."
                                rows={4}
                                required
                                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:ring-foreground/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Size Selection & Stock */}
                <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-2xl">
                    <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Size & Inventory</h3>
                    <div className="grid gap-6">
                        <div className="flex flex-wrap gap-3">
                            {AVAILABLE_SIZES.map((size) => {
                                const isSelected = !!sizes.find((s) => s.name === size);
                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleSize(size)}
                                        className={`px-6 py-3 rounded-xl border text-xs font-black tracking-widest uppercase transition-all duration-300 ${isSelected
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                            : "bg-secondary/50 border-border text-muted-foreground hover:border-foreground/30"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Stock Levels per Size</Label>
                            {sizes.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">Select sizes above to set stock levels.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {sizes.map((s) => (
                                        <div key={s.name} className="bg-secondary/30 border border-border rounded-xl p-4 flex flex-col gap-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-foreground">{s.name}</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={s.stock}
                                                onChange={(e) => updateSizeStock(s.name, parseInt(e.target.value) || 0)}
                                                className="h-10 bg-background/50 border-border focus:ring-foreground/10"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 p-4 bg-foreground/5 rounded-xl border border-border flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculated Total Stock</span>
                            <span className="text-xl font-black text-foreground">{totalStock}</span>
                        </div>
                    </div>
                </div>

                {/* Colors & Multi-Images */}
                <div className="rounded-xl border border-border bg-card p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Colors & Variants</h3>
                        <Button type="button" onClick={addColor} variant="ghost" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-all">
                            <Plus className="w-3 h-3 mr-2" /> Add Color
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {colors.map((color, index) => (
                            <div key={index} className="flex gap-4 items-end bg-foreground/5 p-4 rounded-xl border border-border">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[9px] text-muted-foreground uppercase font-black">Color Name</Label>
                                    <Input
                                        value={color.name}
                                        onChange={(e) => updateColor(index, "name", e.target.value)}
                                        placeholder="e.g. Stealth Black"
                                        className="h-10 bg-background/50 border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-muted-foreground uppercase font-black">Hex Code</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={color.hex}
                                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                                            className="h-10 w-16 p-1 cursor-pointer bg-background/50 border-border"
                                        />
                                    </div>
                                </div>
                                <Button type="button" onClick={() => removeColor(index)} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-b border-border pb-4 pt-4">
                        <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Multimedia Gallery</h3>
                        <Button type="button" onClick={addImage} variant="ghost" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-all">
                            <Plus className="w-3 h-3 mr-2" /> Add Image URL
                        </Button>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add("border-foreground/50", "bg-foreground/5");
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("border-foreground/50", "bg-foreground/5");
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("border-foreground/50", "bg-foreground/5");
                            const files = Array.from(e.dataTransfer.files);
                            files.forEach(file => {
                                if (file.type.startsWith("image/")) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const base64 = event.target?.result as string;
                                        setImages(prev => [...prev, { url: base64, color: "" }]);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            });
                        }}
                        className="relative border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors mb-4 ring-8 ring-foreground/[0.02]">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Drag and Drop Images</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">or click to browse from files</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach(file => {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const base64 = event.target?.result as string;
                                        setImages(prev => [...prev, { url: base64, color: "" }]);
                                    };
                                    reader.readAsDataURL(file);
                                });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 Brewster-pointer-events-none cursor-pointer"
                        />
                    </div>

                    <div className="grid gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="flex gap-4 items-end bg-foreground/5 p-4 rounded-xl border border-border">
                                <div className="w-16 h-16 rounded-lg bg-background/50 border border-border overflow-hidden shrink-0">
                                    {image.url ? (
                                        <img src={image.url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[9px] text-muted-foreground uppercase font-black">Image URL / Data</Label>
                                    <Input
                                        value={image.url.startsWith("data:") ? "Local File (Base64)" : image.url}
                                        readOnly={image.url.startsWith("data:")}
                                        onChange={(e) => updateImage(index, "url", e.target.value)}
                                        placeholder="Paste image URL here..."
                                        className="h-10 bg-background/50 border-border"
                                    />
                                </div>
                                <div className="w-48 space-y-2">
                                    <Label className="text-[9px] text-muted-foreground uppercase font-black">Associate with Color</Label>
                                    <select
                                        value={image.color}
                                        onChange={(e) => updateImage(index, "color", e.target.value)}
                                        className="w-full h-10 rounded-lg bg-background/50 border border-border text-xs text-muted-foreground px-3 focus:ring-foreground/10"
                                    >
                                        <option value="">No Association</option>
                                        {colors.map((c, i) => (
                                            <option key={i} value={c.name}>{c.name || `Color ${i + 1}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button type="button" onClick={() => removeImage(index)} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Product Details</h3>
                        <Button type="button" onClick={addDetail} variant="ghost" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-all">
                            <Plus className="w-3 h-3 mr-2" /> Add Bullet Point
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {details.map((detail, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={detail}
                                    onChange={(e) => updateDetail(index, e.target.value)}
                                    placeholder="e.g. 100% Breathable Cotton"
                                    className="h-11 bg-secondary/50 border-border"
                                />
                                <Button type="button" onClick={() => removeDetail(index)} variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground/60 hover:text-red-400">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Organization & Finalize */}
            <div className="space-y-8">
                <div className="rounded-xl border border-border bg-card p-8 space-y-6 shadow-2xl sticky top-24">
                    <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Organization</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Category</Label>
                            <select
                                id="categoryId"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-lg border border-border bg-secondary/50 text-foreground h-12 px-3 focus:outline-none focus:ring-1 focus:ring-foreground/10 text-sm"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tag" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Tag</Label>
                            <Input
                                id="tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="New, Limited, etc."
                                className="border-border bg-secondary/50 text-foreground h-12"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    <h3 className="text-sm font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Inventory & Pricing</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Price (L.E)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="599.00"
                                required
                                className="border-border bg-secondary/50 text-foreground h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compareAtPrice" className="flex items-center gap-2 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                                Compare at Price
                                <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm lowercase tracking-normal">Discount</span>
                            </Label>
                            <Input
                                id="compareAtPrice"
                                type="number"
                                value={compareAtPrice}
                                onChange={(e) => setCompareAtPrice(e.target.value)}
                                placeholder="899.00 (Optional)"
                                className="border-border bg-secondary/50 text-foreground h-12"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Sets the original price before discount to trigger the sale ribbon.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 h-14 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-500 shadow-3xl group"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <Save className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" />
                                {initialData ? "Save Changes" : "Create Product"}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
