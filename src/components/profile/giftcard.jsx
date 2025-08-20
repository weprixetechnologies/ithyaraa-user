import React, { useState } from 'react'
import RedeemGiftcard from './redeemgiftcard'

const GiftCard = () => {
    const [activeTab, setActiveTab] = useState('redeemgiftcard')

    return (
        <div className='p-4'>
            <p className='text-[24px] font-medium mb-5'>Giftcard</p>
            {/* <div className="flex w-full justify-between items-center mb-10"> */}
            <div className="tab-selectors flex gap-2">
                <section className={`px-2 cursor-pointer py-1.5 rounded-t-lg ${activeTab === 'redeemgiftcard' ? 'bg-primary-yellow text-white font-medium' : 'bg-transparent'}`} onClick={() => { setActiveTab('redeemgiftcard') }}>
                    <p className="text-sm">Redeem Giftcard</p>
                </section>
                <section className={`px-2 cursor-pointer py-1.5 rounded-t-lg ${activeTab === 'recharge' ? 'bg-primary-yellow text-white font-medium' : 'bg-transparent'}`} onClick={() => { setActiveTab('recharge') }}>
                    <p className="text-sm">Topup Wallet</p>
                </section>
            </div>
            <hr className='border-primary-yellow mb-4 border' />
            <div className="  ">
                {activeTab === "redeemgiftcard" && <RedeemGiftcard />}
                {activeTab === "recharge" && <p> COMING SOON
                     </p>}
            </div>
            {/* </div> */}
        </div>
    )
}

export default GiftCard
