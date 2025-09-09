
'use client'
import React, { useState } from 'react'
import MyProfile from './myprofile'
import ChangePassword from './changePassword'

const AccountDetail = ({ user }) => {
    const [activeTab, setActiveTab] = useState('myprofile')
    return (
        <div className=' p-4'>
            <div className="text-lg font-medium mb-3">Account Details</div>
            <div className="tab-selectors flex gap-2">
                <section className={`px-2 cursor-pointer py-1.5 rounded-t-lg ${activeTab === 'myprofile' ? 'bg-primary-yellow text-white font-medium' : 'bg-transparent'}`} onClick={() => { setActiveTab('myprofile') }}>
                    <p className="text-sm">My Profile</p>
                </section>
                <section className={`px-2 cursor-pointer py-1.5 rounded-t-lg ${activeTab === 'changepassword' ? 'bg-primary-yellow text-white font-medium' : 'bg-transparent'}`} onClick={() => { setActiveTab('changepassword') }}>
                    <p className="text-sm">Change Password</p>
                </section>
            </div>
            <hr className='border-primary-yellow mb-4' />
            <div className="  ">
                {activeTab === "myprofile" && <MyProfile user={user} />}
                {activeTab === "changepassword" && <ChangePassword />}
            </div>
        </div>
    )
}

export default AccountDetail
