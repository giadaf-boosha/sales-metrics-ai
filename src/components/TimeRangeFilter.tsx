import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

interface TimeRangeFilterProps {
  onFilterChange: (value: string) => void;
  onMonthChange: (month: number) => void;
  onDateFilterChange: (type: string, month: number) => void;
}

export function TimeRangeFilter({ 
  onFilterChange, 
  onMonthChange,
  onDateFilterChange 
}: TimeRangeFilterProps) {
  const [currentMonth] = useState(() => new Date().getMonth() + 1); // 1-12
  const [meetingMonth, setMeetingMonth] = useState(currentMonth);
  const [contractMonth, setContractMonth] = useState(currentMonth);

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

  useEffect(() => {
    onMonthChange(currentMonth);
  }, [currentMonth, onMonthChange]);

  const handleMeetingMonthChange = (value: string) => {
    const month = parseInt(value);
    setMeetingMonth(month);
    onDateFilterChange('meeting', month);
  };

  const handleContractMonthChange = (value: string) => {
    const month = parseInt(value);
    setContractMonth(month);
    onDateFilterChange('contract', month);
  };

  return (
    <div className="flex gap-4">
      <div className="w-[200px]">
        <Select defaultValue="month" onValueChange={onFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-[200px]">
        <Select 
          defaultValue={meetingMonth.toString()} 
          onValueChange={handleMeetingMonthChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Meeting Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label} (Meeting)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[200px]">
        <Select 
          defaultValue={contractMonth.toString()} 
          onValueChange={handleContractMonthChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Contract Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label} (Contract)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}