import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentWithNames } from "@shared/schema";

type ReportChartsProps = {
  startDate: string;
  endDate: string;
};

// Mock data - in a real app, this would come from the API
const mockData = {
  daysOfWeek: [
    { name: "Segunda", count: 15 },
    { name: "Terça", count: 20 },
    { name: "Quarta", count: 18 },
    { name: "Quinta", count: 22 },
    { name: "Sexta", count: 16 },
  ],
  treatments: [
    { name: "Fisioterapia", count: 35 },
    { name: "Terapia Ocupacional", count: 25 },
    { name: "Fonoaudiologia", count: 15 },
    { name: "Psicologia", count: 10 },
    { name: "Outros", count: 5 },
  ],
  absenceRate: [
    { date: "01/07", rate: 10 },
    { date: "02/07", rate: 15 },
    { date: "03/07", rate: 8 },
    { date: "04/07", rate: 12 },
    { date: "05/07", rate: 20 },
  ],
  vehicleOccupation: [
    { vehicle: "Van 1", rate: 85 },
    { vehicle: "Van 2", rate: 70 },
    { vehicle: "Van 3", rate: 90 },
    { vehicle: "Carro 1", rate: 60 },
  ],
};

const ReportCharts = ({ startDate, endDate }: ReportChartsProps) => {
  const [periodFilter, setPeriodFilter] = useState("week");

  // This query would normally fetch report data based on date range
  // Using a simple query just as a placeholder
  const { data: appointments } = useQuery<AppointmentWithNames[]>({
    queryKey: [`/api/appointments?date=${startDate}`],
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Relatórios de Transporte</h2>
          <p className="text-neutral-500">Análise de uso do sistema de transporte</p>
        </div>
        
        <div className="flex items-center bg-white rounded-lg shadow p-2 w-full md:w-auto">
          <span className="text-neutral-500 mr-2">Período:</span>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="border-0 shadow-none">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold">Uso de Transporte por Dia</h3>
          </CardHeader>
          <CardContent className="p-6 h-64 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <i className="ri-bar-chart-grouped-line text-5xl"></i>
              <p className="mt-2">Gráfico de barras: Uso por dia da semana</p>
              <div className="mt-4 text-xs text-left">
                {mockData.daysOfWeek.map((day) => (
                  <div key={day.name} className="flex justify-between mb-1">
                    <span>{day.name}</span>
                    <span>{day.count} pacientes</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold">Distribuição por Tipo de Tratamento</h3>
          </CardHeader>
          <CardContent className="p-6 h-64 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <i className="ri-pie-chart-line text-5xl"></i>
              <p className="mt-2">Gráfico de pizza: Pacientes por especialidade</p>
              <div className="mt-4 text-xs text-left">
                {mockData.treatments.map((treatment) => (
                  <div key={treatment.name} className="flex justify-between mb-1">
                    <span>{treatment.name}</span>
                    <span>{treatment.count} pacientes</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold">Taxa de Ausências</h3>
          </CardHeader>
          <CardContent className="p-6 h-64 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <i className="ri-line-chart-line text-5xl"></i>
              <p className="mt-2">Gráfico de linha: Ausências ao longo do tempo</p>
              <div className="mt-4 text-xs text-left">
                {mockData.absenceRate.map((item) => (
                  <div key={item.date} className="flex justify-between mb-1">
                    <span>{item.date}</span>
                    <span>{item.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 border-b">
            <h3 className="font-semibold">Relatório de Ocupação</h3>
          </CardHeader>
          <CardContent className="p-6 h-64 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <i className="ri-bar-chart-line text-5xl"></i>
              <p className="mt-2">Gráfico de barras: Taxa de ocupação por veículo</p>
              <div className="mt-4 text-xs text-left">
                {mockData.vehicleOccupation.map((vehicle) => (
                  <div key={vehicle.vehicle} className="flex justify-between mb-1">
                    <span>{vehicle.vehicle}</span>
                    <span>{vehicle.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReportCharts;
