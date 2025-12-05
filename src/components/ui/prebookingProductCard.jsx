import React from 'react'
import Image from 'next/image'
import PresaleCardCounter from './presalecardCounter'
import { useRouter } from 'next/navigation'

const PreBookingProductCard = ({ products = [] }) => {
    const router = useRouter()
    console.log(products);

    return (
        <div className="w-full">
            {products.length > 0 ? (
                <div>
                    {products.map((product) => {
                        const featuredImage = product?.featuredImage || [];
                        const imageUrl = featuredImage?.[0]?.imgUrl || "/placeholder-product.jpg";

                        return (
                            <div
                                key={product.presaleProductID}
                                onClick={() => router.push(`/presale/product/${product.presaleProductID}`)}
                                className="w-[250px] overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer hover:shadow-lg hover:shadow-gray-300 hover:p-2 rounded-lg"
                            >
                                <div className="h-auto aspect-[170/222] w-full max-w-[300px] relative rounded-lg overflow-hidden">
                                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={product?.name || 'Product'}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover"
                                            priority={false}
                                        />
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className='text-[16px] font-medium text-center mb-2 line-clamp-2'>{product?.name}</p>
                                    <div className="flex justify-center items-center gap-2">
                                        <span className="text-gray-500 text-sm font-medium line-through">₹{Math.round(product?.regularPrice || 0)}</span>
                                        <span className="text-black text-lg font-bold">₹{Math.round(product?.salePrice || 0)}</span>
                                        <span className="text-xs text-center text-green-500 font-medium " style={{ letterSpacing: '0.05em' }}>
                                            ({Math.round(product?.discountValue || 0)}
                                            {product?.discountType === "percentage"
                                                ? "% "
                                                : product?.discountType === "flat"
                                                    ? "/- "
                                                    : ` ${product?.discountType || ''}`}
                                            Off)
                                        </span>
                                    </div>
                                    <p className='text-sm text-center text-red-500 font-medium my-2' style={{ letterSpacing: '0.05em' }}>Ends In</p>
                                    <PresaleCardCounter datetime={product.preSaleEndDate} />

                                </div>
                                <button className='w-full bg-primary-yellow text-black font-semibold py-2 rounded-lg letter-spacing-wide cursor-pointer hover:text-white hover:bg-orange-500 transition-all duration-300' style={{ letterSpacing: '0.05em' }}>Buy Now</button>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center p-4">
                    <p>No products found</p>
                </div>
            )}
        </div>
    )
}

export default PreBookingProductCard
