import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { whatsappUrl } from '@/utils/helpers';

export default function WhatsAppFab() {
  const { content } = useSiteContent();
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={whatsappUrl(content.settings.whatsapp_number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#1FAF54] p-4 text-white shadow-[0_10px_30px_-5px_rgba(31,175,84,0.5)] transition-colors hover:bg-[#178F44] sm:bottom-8 sm:right-8"
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.6, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1FAF54] opacity-20" />
      <MessageCircle className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-500 group-hover:max-w-[140px] sm:inline">
        Chat with us
      </span>
    </motion.a>
  );
}
