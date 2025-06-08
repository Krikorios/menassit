import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import FocusMode from "./FocusMode";

interface FocusButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function FocusButton({ 
  variant = "outline", 
  size = "default",
  className = ""
}: FocusButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={`gap-2 ${className}`}
        data-tour="focus-mode"
      >
        <Target className="h-4 w-4" />
        {size !== "icon" && t('focus.enterFocus', 'Focus Mode')}
      </Button>
      
      <FocusMode 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}