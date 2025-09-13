// Centralized imports for better tree shaking and code splitting
// This helps reduce bundle size by avoiding duplicate imports

// React icons - only import what's needed
export {
    MdOutlineMarkEmailRead,
    MdAccountBalanceWallet,
    MdPayment,
    MdHistory,
    MdPending
} from "react-icons/md";

export {
    CgProfile
} from "react-icons/cg";

export {
    IoExitOutline
} from "react-icons/io5";

export {
    BsFillStarFill
} from "react-icons/bs";

export {
    CiHeart,
    CiRuler,
    CiDeliveryTruck
} from "react-icons/ci";

export {
    RiSecurePaymentLine
} from "react-icons/ri";

// Common React components
export {
    Suspense,
    lazy
} from "react";

// Next.js components
export { default as Image } from "next/image";
export { default as dynamic } from "next/dynamic";

// Redux
export {
    useDispatch,
    useSelector
} from "react-redux";

// Other utilities
export {
    ClipLoader
} from "react-spinners";

export {
    toast
} from "react-toastify";
