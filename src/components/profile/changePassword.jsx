import React, { useState } from 'react';

const ChangePassword = () => {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add password change logic (API call or validation)
        alert('Updated')
        console.log('Passwords:', passwords);
    };

    return (
        <div className="flex justify-center items-center  bg-gray-50 py-5">
            <div className="w-[70%] max-w-md bg-white  rounded-2xl p-8 mt-5">

                <form onSubmit={handleSubmit} className="space-y-5 flex flex-col gap-3">

                    {/* Old Password */}
                    <div >
                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-600 mb-1">
                            Old Password
                        </label>
                        <input
                            type="password"
                            id="oldPassword"
                            name="oldPassword"
                            value={passwords.oldPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                            placeholder="Enter your old password"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                            placeholder="Enter a new password"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className='mb-5'>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1 ">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                            placeholder="Re-enter your new password"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-primary-yellow text-black font-medium py-2 rounded-lg shadow hover:bg-yellow-400 transition-colors"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
