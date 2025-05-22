import { useQuery } from "@tanstack/react-query";

type TransportStatsProps = {
  date: string;
};

type StatsData = {
  total: number;
  confirmed: number;
  absent: number;
};

const TransportStats = ({ date }: TransportStatsProps) => {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: [`/api/stats/transport?date=${date}`],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Total de Pacientes</p>
            <p className="text-2xl font-semibold">{stats?.total || 0}</p>
          </div>
          <div className="bg-primary bg-opacity-10 p-3 rounded-full">
            <i className="ri-user-line text-primary text-xl"></i>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Pacientes Confirmados</p>
            <p className="text-2xl font-semibold">{stats?.confirmed || 0}</p>
          </div>
          <div className="bg-[#2E7D32] bg-opacity-10 p-3 rounded-full">
            <i className="ri-check-line text-[#2E7D32] text-xl"></i>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Ausências</p>
            <p className="text-2xl font-semibold">{stats?.absent || 0}</p>
          </div>
          <div className="bg-[#D32F2F] bg-opacity-10 p-3 rounded-full">
            <i className="ri-close-line text-[#D32F2F] text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportStats;
