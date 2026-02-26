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
    const [stock, setStock] = useState(initialData?.stock?.toString() || "");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [tag, setTag] = useState(initialData?.tag || "");

    // Dynamic Arrays - Handle JSON parsing if needed
    const [colors, setColors] = useState<{ name: string; hex: string }[]>(
        initialData?.colors ? (typeof initialData.colors === 'string' ? JSON.parse(initialData.colors) : initialData.colors) : []
    );
    const [images, setImages] = useState<{ url: string; color?: string }[]>(
        initialData?.images ? (typeof initialData.images === 'string' ? JSON.parse(initialData.images) : initialData.images) : []
    );
    const [details, setDetails] = useState<string[]>(
        initialData?.details ? (typeof initialData.details === 'string' ? JSON.parse(initialData.details) : initialData.details) : [""]
    );

    // Helpers
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
            description,
            details: details.filter(d => d.trim() !== ""),
            images, // already objects
            sizes: ["S", "M", "L", "XL", "XXL"], // Default sizes
            colors: colors.filter(c => c.name.trim() !== ""),
            categoryId,
            stock: parseInt(stock),
            tag,
        };

        try {
            if (initialData?.id) {
                await updateProduct(initialData.id, data);
            } else {
                // send as a single JSON string to avoid nested arrays
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
                                        <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ backgroundColor: color.hex }} />
                                        <Input
                                            value={color.hex}
                                            onChange={(e) => updateColor(index, "hex", e.target.value)}
                                            placeholder="#1a472a"
                                            className="h-10 w-28 bg-background/50 border-border font-mono text-xs"
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
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                            <Label htmlFor="stock" className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Stock Level</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="100"
                                required
                                className="border-border bg-secondary/50 text-foreground h-12"
                            />
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
