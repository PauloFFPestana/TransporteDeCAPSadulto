import { useState } from "react";
import TransportStats from "@/components/dashboard/TransportStats";
import TransportList from "@/components/dashboard/TransportList";

const DailyList = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Lista de Transporte</h2>
          <p className="text-neutral-500">Gerenciamento diário de transporte de pacientes</p>
        </div>
        
        <div className="flex items-center bg-white rounded-lg shadow p-2 w-full md:w-auto">
          <button 
            className="p-2 text-neutral-500 hover:text-primary"
            onClick={handlePreviousDay}
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
          <input 
            type="date" 
            className="border-0 p-2 focus:outline-none text-center" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button 
            className="p-2 text-neutral-500 hover:text-primary"
            onClick={handleNextDay}
          >
            <i className="ri-arrow-right-s-line text-xl"></i>
          </button>
        </div>
      </div>

      <TransportStats date={selectedDate} />
      <TransportList date={selectedDate} />
    </div>
  );
};

export default DailyList;
