import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LanguageFilterTabsProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: string[];
}

export default function LanguageFilterTabs({ selectedLanguage, onLanguageChange, languages }: LanguageFilterTabsProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-terracotta/10 via-sage/10 to-peach/10"
      style={{
        backgroundImage: 'url(/assets/generated/language-filter-bg.dim_800x100.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
    >
      <Tabs value={selectedLanguage} onValueChange={onLanguageChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-background/80 backdrop-blur">
          {languages.map((lang) => (
            <TabsTrigger
              key={lang}
              value={lang}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-terracotta data-[state=active]:to-coral data-[state=active]:text-white"
            >
              {lang}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
