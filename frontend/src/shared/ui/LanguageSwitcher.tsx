import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './Button';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language.startsWith('en') ? 'pt-BR' : 'en';
    i18n.changeLanguage(nextLng);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-2 hover:bg-gray-200/50"
      title={i18n.language.startsWith('en') ? 'Switch to Portuguese' : 'Mudar para Inglês'}
    >
      <Globe size={16} strokeWidth={2.5} />
      <span className="uppercase text-[10px] font-extrabold tracking-widest opacity-60">
        {i18n.language.split('-')[0]}
      </span>
    </Button>
  );
};
