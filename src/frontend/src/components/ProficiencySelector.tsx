import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import type { ProficiencyLevel } from '../backend';

const LANGUAGES = ['English', 'Japanese', 'Bengali', 'Spanish', 'French', 'German', 'Korean', 'Mandarin', 'Hindi', 'Arabic'];

const LEVELS = {
  Native: ['Native'],
  JLPT: ['N5', 'N4', 'N3', 'N2', 'N1'],
  CEFR: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  HSK: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'],
};

interface ProficiencySelectorProps {
  value: ProficiencyLevel[];
  onChange: (levels: ProficiencyLevel[]) => void;
}

export default function ProficiencySelector({ value, onChange }: ProficiencySelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const addLevel = () => {
    if (!selectedLanguage || !selectedLevel) return;
    if (value.some((l) => l.language === selectedLanguage)) return;

    onChange([...value, { language: selectedLanguage, level: selectedLevel }]);
    setSelectedLanguage('');
    setSelectedLevel('');
  };

  const removeLevel = (language: string) => {
    onChange(value.filter((l) => l.language !== language));
  };

  const availableLanguages = LANGUAGES.filter((lang) => !value.some((l) => l.language === lang));

  return (
    <div className="space-y-3">
      <Label>Language Proficiency Levels</Label>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((level) => (
          <div key={level.language} className="flex items-center gap-2 bg-sage/10 border border-sage/30 rounded-full px-3 py-1">
            <span className="text-sm font-medium">{level.language}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm">{level.level}</span>
            <button onClick={() => removeLevel(level.language)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEVELS).map(([category, levels]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addLevel} disabled={!selectedLanguage || !selectedLevel} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
