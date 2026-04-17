'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppImage } from '@/components/ui/AppImage'
import { toast } from '@/lib/simple-sonner'
import {
    Plus,
    Package,
    Loader2,
    Trash2,
    Edit2,
    X,
    Camera,
    Save,
    ExternalLink,
    Shirt,
    Sparkles
} from 'lucide-react'

export interface Product {
    id: string
    name: string
    description?: string
    category?: string
    price?: number
    discount?: number
    stock?: number
    sku?: string
    try_on_compatible?: boolean
    link?: string
    tags?: string[]
    audience?: string
    cover_image?: string
    tryon_image?: string
    images?: string[]
    active: boolean
    created_at: string
}

interface GeneratedProductVisual {
    id: string
    label: string
    preset: string
    imageUrl: string
    imageBase64: string
}

interface ProductsClientProps {
    initialProducts: Product[]
}

const CATEGORIES = ['Clothing', 'Accessories', 'Footwear', 'Beauty', 'Lifestyle', 'Electronics', 'Home', 'Other']
const AUDIENCES = ['Men', 'Women', 'Unisex', 'Kids']
const MAX_IMAGES = 8
const MAX_IMAGE_DIMENSION = 1600
const MAX_PRODUCT_PAYLOAD_BYTES = 9 * 1024 * 1024
const MIN_JPEG_QUALITY = 0.55

async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(file)
    })
}

async function compressImageDataUrl(dataUrl: string): Promise<string> {
    return await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const maxSide = Math.max(img.width, img.height)
            const scale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1
            const targetWidth = Math.max(1, Math.round(img.width * scale))
            const targetHeight = Math.max(1, Math.round(img.height * scale))

            const canvas = document.createElement('canvas')
            canvas.width = targetWidth
            canvas.height = targetHeight
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Failed to process image'))
                return
            }

            ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

            let quality = 0.86
            let output = canvas.toDataURL('image/jpeg', quality)

            // Keep reducing quality for large images to avoid request body overflow.
            while (output.length > 2_000_000 && quality > MIN_JPEG_QUALITY) {
                quality -= 0.08
                output = canvas.toDataURL('image/jpeg', quality)
            }

            resolve(output)
        }
        img.onerror = () => reject(new Error('Invalid image file'))
        img.src = dataUrl
    })
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
    const router = useRouter()
    // Hydrate state from Server Prop
    const [products, setProducts] = useState<Product[]>(initialProducts)
    // No loading state needed for initial load (it's instant)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    // Update internal state when server prop changes (e.g. after router.refresh())
    useEffect(() => {
        setProducts(initialProducts)
    }, [initialProducts])

    // Form state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [price, setPrice] = useState('')
    const [discount, setDiscount] = useState('')
    const [stock, setStock] = useState('')
    const [sku, setSku] = useState('')
    const [tryOnCompatible, setTryOnCompatible] = useState(false)
    const [link, setLink] = useState('')
    const [tags, setTags] = useState('')
    const [audience, setAudience] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [coverIndex, setCoverIndex] = useState(0)
    const [tryonIndex, setTryonIndex] = useState<number | null>(null)
    const [generatingVisuals, setGeneratingVisuals] = useState(false)
    const [generatedVisuals, setGeneratedVisuals] = useState<GeneratedProductVisual[]>([])

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Replaces "fetchProducts" - requests a Server Component refresh
    const refreshData = () => {
        router.refresh()
    }

    const resetForm = () => {
        setName('')
        setDescription('')
        setCategory('')
        setPrice('')
        setDiscount('')
        setStock('')
        setSku('')
        setTryOnCompatible(false)
        setLink('')
        setTags('')
        setAudience('')
        setImages([])
        setCoverIndex(0)
        setTryonIndex(null)
        setGeneratedVisuals([])
        setEditingProduct(null)
        setShowForm(false)
    }

    const openEditForm = (product: Product) => {
        setEditingProduct(product)
        setName(product.name)
        setDescription(product.description || '')
        setCategory(product.category || '')
        setPrice(product.price?.toString() || '')
        setDiscount(product.discount?.toString() || '')
        setStock(product.stock?.toString() ?? '')
        setSku(product.sku || '')
        setTryOnCompatible(product.try_on_compatible ?? false)
        setLink(product.link || '')
        setTags(product.tags?.join(', ') || '')
        setAudience(product.audience || '')
        setImages(product.images || [])
        setGeneratedVisuals([])

        // Find cover and tryon indices
        if (product.images && product.images.length > 0) {
            const coverIdx = product.cover_image
                ? product.images.findIndex(img => img === product.cover_image)
                : 0
            setCoverIndex(coverIdx >= 0 ? coverIdx : 0)

            const tryonIdx = product.tryon_image
                ? product.images.findIndex(img => img === product.tryon_image)
                : null
            setTryonIndex(tryonIdx !== null && tryonIdx >= 0 ? tryonIdx : null)
        } else {
            setCoverIndex(0)
            setTryonIndex(null)
        }

        setShowForm(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const incoming = Array.from(files)

        if (images.length + incoming.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        try {
            const processed: string[] = []
            for (const file of incoming) {
                const rawDataUrl = await fileToDataUrl(file)
                const compressed = await compressImageDataUrl(rawDataUrl)
                processed.push(compressed)
            }
            setImages(prev => [...prev, ...processed])
        } catch (error) {
            console.error('Image upload processing error:', error)
            toast.error('Failed to process selected image(s). Please try smaller files.')
        } finally {
            // Allow selecting the same file again after failure/success.
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))

        // Adjust cover/tryon indices
        if (coverIndex === index) {
            setCoverIndex(0)
        } else if (coverIndex > index) {
            setCoverIndex(prev => prev - 1)
        }

        if (tryonIndex === index) {
            setTryonIndex(null)
        } else if (tryonIndex !== null && tryonIndex > index) {
            setTryonIndex(prev => prev !== null ? prev - 1 : null)
        }
    }

    const setCover = (index: number) => {
        setCoverIndex(index)
        toast.success('Cover image set!')
    }

    const setTryon = (index: number) => {
        if (tryonIndex === index) {
            // Toggle off if clicking same image
            setTryonIndex(null)
            toast.info('Try-on image removed')
        } else {
            setTryonIndex(index)
            toast.success('Try-on image set!')
        }
    }

    const handleGenerateProductVisuals = async () => {
        const sourceImage = images[coverIndex] || images[0]
        if (!sourceImage) {
            toast.error('Upload at least one product image first.')
            return
        }

        setGeneratingVisuals(true)
        setGeneratedVisuals([])

        try {
            const res = await fetch('/api/brand/products/generate-visuals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productImage: sourceImage,
                    productName: name.trim() || undefined,
                    category: category || undefined,
                    description: description.trim() || undefined,
                    audience: audience || undefined,
                    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                    price: price ? parseFloat(price) : undefined,
                }),
            })

            const data = await res.json().catch(() => ({ error: 'Request failed' }))
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to generate product visuals')
            }

            const visuals = Array.isArray(data.visuals) ? (data.visuals as GeneratedProductVisual[]) : []
            if (visuals.length === 0) {
                throw new Error('No product visuals were returned')
            }

            const newImages = visuals.map((visual) => visual.imageUrl || visual.imageBase64).filter(Boolean)
            const startIndex = images.length
            setImages(prev => [...prev, ...newImages])
            setGeneratedVisuals(visuals)
            setCoverIndex(startIndex)

            if (data.partial) {
                toast.success(`Generated ${visuals.length} visuals. A couple of variations may need another try.`)
            } else {
                toast.success(`Generated ${visuals.length} polished product visuals.`)
            }
        } catch (error) {
            console.error('Generate product visuals error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate product visuals')
        } finally {
            setGeneratingVisuals(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error('Product name is required')
            return
        }
        setSaving(true)

        // 1. Optimistic Update
        const tempId = `temp-${Date.now()}`
        const optimisticProduct: Product = {
            id: editingProduct?.id || tempId,
            name: name.trim(),
            description: description.trim() || undefined,
            category: category || undefined,
            price: price ? parseFloat(price) : undefined,
            discount: discount ? parseFloat(discount) : undefined,
            stock: stock ? parseInt(stock, 10) : undefined,
            sku: sku.trim() || undefined,
            try_on_compatible: tryOnCompatible,
            link: link.trim() || undefined,
            tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            audience: audience || undefined,
            cover_image: images[coverIndex] || images[0] || undefined,
            tryon_image: tryonIndex !== null ? images[tryonIndex] : undefined,
            images: images,
            active: true,
            created_at: new Date().toISOString()
        }

        // Snapshot previous state for rollback
        const previousProducts = [...products]

        // Update UI immediately
        setProducts(prev => {
            if (editingProduct) {
                return prev.map(p => p.id === editingProduct.id ? optimisticProduct : p)
            }
            return [optimisticProduct, ...prev]
        })

        // Close form immediately for "instant" feel
        setShowForm(false)
        toast.info(editingProduct ? 'Saving changes...' : 'Creating product...')

        // Reset form state now (or after success? doing it now is riskier but feels faster)
        // Let's reset purely UI state, but keep data fields until success just in case we need to reopen?
        // Actually, for "instant" feel, we close the modal.

        try {
            const productData = { ...optimisticProduct }
            // Remove temp fields if any
            if (productData.id.startsWith('temp-')) delete (productData as any).id

            const method = editingProduct ? 'PUT' : 'POST'
            const url = editingProduct
                ? `/api/brand/products/${editingProduct.id}`
                : '/api/brand/products'
            const payload = JSON.stringify(productData)
            const payloadBytes = new TextEncoder().encode(payload).length
            if (payloadBytes > MAX_PRODUCT_PAYLOAD_BYTES) {
                toast.error('Images are too large. Please remove a few images or upload smaller ones.')
                setProducts(previousProducts)
                setShowForm(true)
                return
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            })

            const responseText = await res.text()
            const data = responseText ? JSON.parse(responseText) : {}

            if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)

            // Success: Update with real data (server response might have generated fields like ID)
            const realProduct = data.product

            // Update the temp product with the real one
            setProducts(prev => prev.map(p => p.id === tempId ? realProduct : (p.id === realProduct.id ? realProduct : p)))

            toast.success(editingProduct ? 'Product updated!' : 'Product created!')
            resetForm()
            // We still trigger refresh to sync server cache, but UI is already consistent
            refreshData()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save product'
            const isBodyParseError =
                message.toLowerCase().includes('unterminated string') ||
                message.toLowerCase().includes('unexpected end of json')
            const isImageTooLarge = message.toLowerCase().includes('too large')

            if (!isImageTooLarge) {
                console.error('Failed to save product:', error)
            }
            toast.error(
                isBodyParseError
                    ? 'Upload too large. Please use fewer/smaller images and try again.'
                    : message
            )

            // Revert State
            setProducts(previousProducts)
            setShowForm(true) // Re-open form
        } finally {
            setSaving(false)
        }
    }

    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

    useEffect(() => {
        const isModalOpen = showForm || Boolean(deleteConfirm)
        if (!isModalOpen) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            if (deleteConfirm) {
                setDeleteConfirm(null)
                return
            }
            if (showForm) {
                resetForm()
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [showForm, deleteConfirm])

    const handleDeleteClick = (product: Product) => {
        setDeleteConfirm({ id: product.id, name: product.name })
    }

    const handleDelete = async (productId: string) => {
        setDeleteConfirm(null)
        // 1. Optimistic Delete
        const previousProducts = [...products]
        setProducts(prev => prev.filter(p => p.id !== productId))
        toast.info('Deleting product...')

        try {
            const res = await fetch(`/api/brand/products/${productId}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Product deleted!')
            refreshData()
        } catch (error) {
            console.error('Failed to delete product:', error)
            toast.error('Failed to delete product')
            // Revert
            setProducts(previousProducts)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        )
    }

    // Rendering logic for interactive form...
    // (Truncated for brevity in thought, but full code is in call)
    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black mb-1">Products</h1>
                    <p className="text-black/60 font-medium">
                        Manage your product catalog - {products.length} products
                    </p>
                </div>
                <button type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-[#B4F056] border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Add Product
                </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[70] overflow-y-auto bg-black/55 backdrop-blur-[2px] px-4 pb-6 pt-24 md:pt-28"
                    onClick={resetForm}
                >
                    <div
                        className="mx-auto bg-[#FFFDF8] rounded-2xl border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[calc(100dvh-7rem)] md:max-h-[calc(100dvh-8rem)] overflow-y-auto animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b-[3px] border-black">
                            <h2 className="text-xl font-black">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                    placeholder="e.g., Summer Collection T-Shirt"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none resize-none"
                                    placeholder="Describe your product..."
                                />
                            </div>

                            {/* Category & Audience */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-bold bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        Target Audience
                                    </label>
                                    <select
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-bold bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                    >
                                        <option value="">Select audience</option>
                                        {AUDIENCES.map(aud => (
                                            <option key={aud} value={aud}>{aud}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price, Discount, Stock, SKU */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        Price (INR)
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                        placeholder="999"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        step="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                        placeholder="0"
                                        min="0"
                                        step="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                        placeholder="e.g. SKU-001"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={tryOnCompatible}
                                        onChange={(e) => setTryOnCompatible(e.target.checked)}
                                        className="w-4 h-4 border-2 border-black"
                                    />
                                    <span className="text-xs font-black uppercase">Try-on compatible</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                    Product Link
                                </label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                                    placeholder="summer, casual, cotton"
                                />
                            </div>

                            {/* Images with Cover/Try-On Selection */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                    Product Images
                                </label>
                                <div className="mb-4 rounded-2xl border-2 border-black bg-[#FFF6D8] p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-wider text-black">Upload Once, Generate Neat Visuals</p>
                                            <p className="text-sm font-medium text-black/65">
                                                Add your base product image, then generate 3 clean storefront visuals using the ad creative engine.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateProductVisuals}
                                            disabled={generatingVisuals || images.length === 0}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-black bg-[#FFD93D] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[0.99] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/45 disabled:shadow-none"
                                        >
                                            {generatingVisuals ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generating 3 visuals
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    Generate 3 visuals
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60 mb-3">
                                    Click image to set as <span className="text-[#B4F056] font-bold">COVER</span> (display) or <span className="text-[#FF6B35] font-bold">TRY-ON</span> (virtual try-on)
                                </p>
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`relative w-24 h-24 border-2 ${coverIndex === index ? 'border-[#B4F056] ring-2 ring-[#B4F056]' :
                                                tryonIndex === index ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]' :
                                                    'border-black'
                                                }`}
                                        >
                                            <AppImage
                                                src={img}
                                                alt={`Product ${index + 1}`}
                                                className="object-cover"
                                                sizes="96px"
                                            />

                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-black flex items-center justify-center z-10"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>

                                            {/* Labels */}
                                            <div className="absolute bottom-0 left-0 right-0 flex">
                                                {coverIndex === index && (
                                                    <span className="flex-1 text-[10px] font-black bg-[#B4F056] text-center py-0.5 border-t-2 border-black">
                                                        COVER
                                                    </span>
                                                )}
                                                {tryonIndex === index && (
                                                    <span className="flex-1 text-[10px] font-black bg-[#FF6B35] text-white text-center py-0.5 border-t-2 border-black">
                                                        TRY-ON
                                                    </span>
                                                )}
                                            </div>

                                            {/* Selection buttons on hover */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setCover(index)}
                                                    className={`text-[9px] font-black px-2 py-1 ${coverIndex === index
                                                        ? 'bg-[#B4F056] text-black'
                                                        : 'bg-white/90 text-black hover:bg-[#B4F056]'
                                                        }`}
                                                >
                                                    SET COVER
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTryon(index)}
                                                    className={`text-[9px] font-black px-2 py-1 ${tryonIndex === index
                                                        ? 'bg-[#FF6B35] text-white'
                                                        : 'bg-white/90 text-black hover:bg-[#FF6B35] hover:text-white'
                                                        }`}
                                                >
                                                    {tryonIndex === index ? 'REMOVE TRY-ON' : 'SET TRY-ON'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 border-2 border-dashed border-black flex flex-col items-center justify-center gap-1 hover:bg-gray-50"
                                    >
                                        <Camera className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase">Add</span>
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {/* Legend */}
                                {images.length > 0 && (
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs mt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-[#B4F056] border border-black" />
                                            <span>Cover: Main display image</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-[#FF6B35] border border-black" />
                                            <span>Try-On: Sent to virtual try-on</span>
                                        </div>
                                    </div>
                                )}
                                {generatedVisuals.length > 0 && (
                                    <div className="mt-4 rounded-2xl border-2 border-black bg-white p-4">
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Latest generated set</p>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            {generatedVisuals.map((visual) => (
                                                <div key={visual.id} className="overflow-hidden rounded-2xl border-2 border-black bg-[#FFFDF8]">
                                                    <div className="relative aspect-square bg-[#F3F0E8]">
                                                        <AppImage
                                                            src={visual.imageUrl || visual.imageBase64}
                                                            alt={visual.label}
                                                            className="object-cover"
                                                            sizes="(min-width: 640px) 33vw, 100vw"
                                                        />
                                                    </div>
                                                    <div className="border-t-2 border-black px-3 py-2">
                                                        <p className="text-[11px] font-black uppercase tracking-wide text-black">{visual.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-black">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-3 font-black uppercase border-2 border-black hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 font-black uppercase bg-[#B4F056] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingProduct ? 'Update' : 'Create'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-black/20">
                    <Package className="w-16 h-16 mx-auto mb-4 text-black/30" />
                    <h3 className="text-xl font-black text-black/60 mb-2">No Products Yet</h3>
                    <p className="text-black/40 font-medium mb-6">
                        Add your first product to get started
                    </p>
                    <button type="button"
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#B4F056] border-[3px] border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
                        const coverImageSrc = product.cover_image ?? product.images?.[0] ?? null

                        return (
                        <div
                            key={product.id}
                            className="group overflow-hidden rounded-[28px] border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] bg-[#F3F0E8]">
                                {coverImageSrc ? (
                                    <AppImage
                                        src={coverImageSrc}
                                        alt={product.name}
                                        className="object-cover"
                                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-black/20" />
                                    </div>
                                )}
                                {!product.active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="rounded-full bg-red-500 px-3 py-1 font-black text-sm uppercase text-white">
                                            Inactive
                                        </span>
                                    </div>
                                )}
                                {/* Try-On indicator */}
                                {(product.try_on_compatible || product.tryon_image) && (
                                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-black">
                                        <Shirt className="w-3 h-3" />
                                        Try-on ready
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-4 p-4 sm:p-5">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-black leading-tight">{product.name}</h3>
                                            <p className="mt-1 text-sm font-medium text-black/55">
                                                {product.category || 'Uncategorized'}
                                                {product.sku ? ` · ${product.sku}` : ''}
                                            </p>
                                        </div>
                                        {product.price != null && (
                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-black">{'\u20B9'}{product.price}</p>
                                                {product.discount != null && product.discount > 0 && (
                                                    <p className="text-xs font-bold uppercase text-green-700">{product.discount}% off</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {product.description && (
                                        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-black/65">
                                            {product.description}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <button type="button"
                                        onClick={() => openEditForm(product)}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-black bg-black px-4 text-sm font-black uppercase text-white transition-transform hover:scale-[0.99]"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <div className="flex gap-2">
                                        {product.link && (
                                            <a
                                                href={product.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-black px-4 text-sm font-black uppercase transition-transform hover:scale-[0.99] sm:flex-none"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View
                                            </a>
                                        )}
                                        <button type="button"
                                            onClick={() => handleDeleteClick(product)}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-black px-4 text-sm font-black uppercase text-red-600 transition-transform hover:scale-[0.99] sm:flex-none"
                                            aria-label="Delete product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )
                    })}
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-[70] overflow-y-auto bg-black/55 backdrop-blur-[2px] px-4 pb-6 pt-24 md:pt-28"
                    onClick={() => setDeleteConfirm(null)}
                >
                    <div
                        className="mx-auto bg-[#FFFDF8] rounded-2xl border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-black mb-2">Delete product?</h3>
                        <p className="text-black/70 mb-6">
                            &ldquo;{deleteConfirm.name}&rdquo; will be permanently removed. This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border-2 border-black font-bold uppercase hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="px-4 py-2 bg-red-500 text-white border-2 border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
