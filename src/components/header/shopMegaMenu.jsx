import ShopWithUs from "./ShopWithUs";
const { useState } = require("react");

const ShopMegaMenu = () => {
    const [megaMenu, setMegaMenu] = useState({
        isOpen: false,
        menuName: ''
    });
    return (
        <li
            className="relative"

        >
            <Link href="/" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Home
            </Link>
        </li>
    )
}
export default ShopMegaMenu;