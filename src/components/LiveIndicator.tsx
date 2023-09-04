import { motion } from "framer-motion"

export default function LiveIndicator(){
    return(
        <motion.div
        className="w-2 h-2 rounded-full bg-[#FF0000]"
        style={{
            boxShadow: "0 0 2px rgba(255, 0, 0, 0.3)",
            fontWeight: "600",
        }}
        initial={{ opacity: 1, scale: 1, boxShadow: '0 0 2px rgba(255, 0, 0, 0.3)' }}
        animate={{ opacity: [1, 0.25, 1], scale: [1, 1.2, 1], boxShadow: ['0 0 2px rgba(255, 0, 0, 0.3)', 'none', '0 0 2px rgba(255, 0, 0, 0.3)'] }}
        transition={{ duration: 3, repeat: Infinity }}
        />
    )
}