     {/* Logo & Search */}
            <nav className="flex justify-center  bg-white">
                <section className="flex w-[80%] justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Image src={logo} alt="Site Logo is Loading" width={"auto"} height={100} />
                    </div>
                    <div className="flex gap-4 flex-row items-center">
                        <SearchNavbar />
                        <IoMdHeartEmpty size={24} />
                        <LuShoppingCart size={24} />
                        <div className="border-l border-black h-6"></div>
                        <div className="section">
                            {auth ? (
                                <aside className="flex flex-col items-center">
                                    <p className="text-xs">Welcome Back</p>
                                    <p className="text-sm font-semibold">{user.name}</p>
                                </aside>
                            ) : (
                                <button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer">
                                    LOGIN / SIGNUP
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </nav>

            {/* Navigation Bar */}
            <section
                className="w-full h-auto py-1 relative"
                style={{
                    background: "#FFF",
                    backgroundImage: "linear-gradient(102deg,rgba(255, 255, 255, 1) 0%, rgba(234, 234, 234, 1) 28%, rgba(234, 234, 234, 1) 71%, rgba(255, 255, 255, 1) 100%)"
                }}
            >

                <div className="relative flex justify-center">
                    {/* Scrollable nav items */}
                    <ul className="flex flex-row items-center gap-10 px-4 min-w-max overflow-x-auto">
                        <li
                            className="relative"

                        >
                            <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Home
                            </Link>
                        </li>
                        <li onMouseEnter={() => setMegaMenu({ isOpen: true, menuName: 'home' })}
                        >
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Shop With Us
                            </Link>
                        </li>
                        <li>
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Combo
                            </Link>
                        </li>
                        <li>
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Our Combos
                            </Link>
                        </li>
                        <li>
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Make Your Combo
                            </Link>
                        </li>


                        <li>
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Customise Your Own
                            </Link>
                        </li>

                        <li>
                            <Link href="/products" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                                Brands
                            </Link>
                        </li>
                        {/* Other nav items */}
                    </ul>

                    {/* Mega Menu Dropdown */}
                    {megaMenu.isOpen && megaMenu.menuName === 'home' && (
                        <ShopWithUs />
                    )}
                </div>
            </section>