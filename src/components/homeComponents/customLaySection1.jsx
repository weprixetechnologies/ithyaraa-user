import React from 'react'

const CustomLaySection1 = () => {
    return (
        <section className="my-10">
            <div className="w-full bg-[#abd6d1]">
                <div className="max-w-6xl mx-auto px-4 md:px-10 py-10 md:py-14 flex flex-col md:flex-row items-center md:items-center justify-between gap-8">
                    {/* Left: Headline */}
                    <div className="md:w-1/2 flex md:block justify-end md:justify-end">
                        <p className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-[0.25em] text-primary-logo-yellow text-right">
                            WINTER<br />SALE
                        </p>
                    </div>

                    {/* Right: Copy + CTA */}
                    <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                        <p className="text-xs md:text-sm text-gray-700 max-w-md">
                            Take 10% off a range of goods in our end of season sale.
                            All sales final – ends soon.
                        </p>
                        <button className="mt-2 inline-flex items-center justify-center px-6 py-2.5 text-xs md:text-sm font-medium rounded-md bg-primary-yellow text-black hover:bg-[#a27350] transition-colors">
                            Shop Sale
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomLaySection1
