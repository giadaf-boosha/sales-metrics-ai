import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeFilterProps {
  onMonthChange: (month: number) => void;
  currentMonth: number;
}

export function TimeRangeFilter({ 
  onMonthChange,
  currentMonth,
}: TimeRangeFilterProps) {
  const months = [
    { value: 1, label: "Gennaio" },
    { value: 2, label: "Febbraio" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Aprile" },
    { value: 5, label: "Maggio" },
    { value: 6, label: "Giugno" },
    { value: 7, label: "Luglio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Settembre" },
    { value: 10, label: "Ottobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Dicembre" },
  ];

  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    onMonthChange(month);
  };

  return (
    <div className="w-[200px]">
      <Select 
        value={currentMonth.toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="bg-gray-50 border border-gray-300 shadow-sm hover:bg-gray-100 transition-colors">
          <SelectValue placeholder="Seleziona Mese" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-300">
          {months.map((month) => (
            <SelectItem 
              key={month.value} 
              value={month.value.toString()}
              className="hover:bg-gray-100 transition-colors"
            >
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}