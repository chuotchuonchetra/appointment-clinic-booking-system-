import { motion } from 'motion/react'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        <motion.h1
          className="text-4xl font-bold text-blue-600 mb-4"
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
        >
          Online Dental Clinic
        </motion.h1>

        <motion.p
          className="text-gray-500 text-lg"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
          }}
        >
          React + TypeScript + Tailwind CSS is ready 🦷
        </motion.p>
      </motion.div>
    </div>
  )
}

export default App
