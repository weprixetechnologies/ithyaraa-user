import React, { useEffect, useState } from 'react'
import InputDynamic from '../ui/inputDynamic'
import InputPassword from '../ui/inputPassword'
import { MdOutlineMarkEmailRead } from "react-icons/md";
import Loading from '../ui/loading';
import success from '../../../public/success.svg'
import Image from 'next/image';
import axiosInstance from '../../lib/axiosInstance'  // <-- make sure this path is correct

const AffiliateDashboard = ({ user }) => {
    return (
        <div className="flex items-start justify-center w-full py-10 px-4">
            <div className="w-full max-w-[1000px]">
                {/* Header */}
                <h2 className="text-3xl font-semibold mb-2">Affiliate Dashboard</h2>
                <p className="text-sm text-gray-500 mb-8">
                    Welcome back, {user?.name || "Partner"}! Here's a quick snapshot.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <p className="text-xs text-gray-500">Total Earnings</p>
                        <p className="text-3xl font-bold mt-1">{Number(user?.pendingPayment) + Number(user?.balance) || 0}</p>
                        <p className="text-xs text-green-600 mt-1">+8% this week</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <p className="text-xs text-gray-500">Pending Earning</p>
                        <p className="text-3xl font-bold mt-1">{user?.pendingPayment || 0}</p>
                        <p className="text-xs text-green-600 mt-1">+3 since yesterday</p>
                    </div>

                    <div className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                        <p className="text-xs text-gray-500">Earnings</p>
                        <p className="text-3xl font-bold mt-1">₹ {user?.balance || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Next payout on 1st</p>
                    </div>
                </div>

                {/* Referral Link */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
                    <p className="text-sm font-medium mb-2">Your referral link</p>
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <div className="flex items-center justify-between w-full md:w-auto bg-gray-50 border rounded-md px-3 py-2 text-xs">
                            <span className="truncate">
                                https://ithyaraa.com/?ref={user?.uid || "your-id"}
                            </span>
                        </div>
                        <button
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    `https://ithyaraa.com/?ref=${user?.uid || ""}`
                                )
                            }
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white border rounded-2xl shadow-sm p-6">
                    <p className="text-sm font-medium mb-4">Recent transactions</p>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b">
                                    <th className="py-3 text-left">Date</th>
                                    <th className="py-3 text-left">Type</th>
                                    <th className="py-3 text-left">Status</th>
                                    <th className="py-3 text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="py-3">2025-09-01</td>
                                    <td className="py-3">Commission</td>
                                    <td className="py-3 text-green-600 font-medium">Confirmed</td>
                                    <td className="py-3">₹ 480</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="py-3">2025-08-28</td>
                                    <td className="py-3">Commission</td>
                                    <td className="py-3 text-yellow-600 font-medium">Pending</td>
                                    <td className="py-3">₹ 320</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3">2025-08-21</td>
                                    <td className="py-3">Payout</td>
                                    <td className="py-3 text-green-600 font-medium">Paid</td>
                                    <td className="py-3">₹ 6,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ApplyAffiliate = ({ user }) => {
    const [isLoading, setIsLoading] = useState(true);   // start loading
    const [submitted, setIsSubmitted] = useState(false);

    useEffect(() => {

        setIsLoading(true)
        // Check affiliate status when component mounts
        if (user?.affiliate === 'approved') {
            setIsSubmitted(false);  // user already approved → keep form but disable button if needed
        } else if (user?.affiliate === 'pending') {
            setIsSubmitted(true);   // already applied
        } else if (user?.affiliate !== 'pending' && user?.affiliate !== 'approved') {
            setIsSubmitted(false);  // new applicant
        }
        setIsLoading(false);


    }, [user]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {

            await axiosInstance.post('/affiliate/apply-affiliate')

            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Something went wrong. Try again!');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading />;

    if (user?.affiliate === 'approved') {
        return <AffiliateDashboard user={user} />
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center w-full py-[100px]">
                <div className="rounded px-4 py-8 max-w-[600px] w-full flex flex-col items-center justify-center">
                    <Image src={success} alt="Success" height={150} width={150} />
                    <p className='text-2xl font-medium mt-4'>Your Application is Submitted !!</p>
                    <p className='text-sm font-medium text-center text-secondary-text-deep'>
                        We've received your application. We will review and inform you via email soon.
                        You know what we mean? We'll make you our partner within 24 hours. Sounds amazing, right?!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full py-[100px]">
            <div className="border rounded p-4 max-w-[600px] w-full">
                <p className='text-lg font-medium text-center'>Apply Affiliate for More Earnings</p>
                <p className="text-xs text-secondary-text-deep text-center max-w-[500px] mx-auto">
                    By filling this form you will apply to our Affiliate Program — which unlocks greater income.
                    Click &amp; read <a href="#" className='underline'>Affiliate Program Policies</a>.
                </p>

                <div className="flex gap-2 flex-col my-10">
                    <InputDynamic
                        icon={<MdOutlineMarkEmailRead />}
                        placeholder="Enter Your Email ID"
                        value={user.emailID || ''}
                        readOnly
                    />
                    <InputPassword
                        placeholder="Enter Your Password"
                        value=""
                    />
                </div>

                <button
                    className="flex justify-center px-2 py-2 border w-full bg-primary-yellow rounded-lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Submitting...' : 'Send for Approval'}
                </button>
            </div>
        </div>
    );
};

export default ApplyAffiliate;
