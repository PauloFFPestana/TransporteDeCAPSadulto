import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Therapist } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TherapistCard from "@/components/therapists/TherapistCard";
import TherapistForm from "@/components/therapists/TherapistForm";

const Therapists = () => {
  const [search, setSearch] = useState("");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  const { data: therapists, isLoading, refetch } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const filteredTherapists = therapists?.filter(therapist => 
    therapist.name.toLowerCase().includes(search.toLowerCase()) ||
    therapist.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Cadastro de Terapeutas</h2>
          <p className="text-neutral-500">Gerenciamento de profissionais de saúde</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar terapeutas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="ri-search-line text-neutral-400"></i>
            </div>
          </div>
          <Button 
            className="bg-primary text-white whitespace-nowrap"
            onClick={() => setIsAddFormOpen(true)}
          >
            <i className="ri-add-line mr-1"></i> Novo Terapeuta
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTherapists && filteredTherapists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTherapists.map((therapist) => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist} 
              onUpdate={refetch}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-2">
            <i className="ri-mental-health-line text-5xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-1">Nenhum terapeuta encontrado</h3>
          <p className="text-neutral-500 mb-4">
            {search ? "Tente buscar com outros termos ou " : ""}
            adicione um novo terapeuta para começar.
          </p>
          <Button 
            className="bg-primary text-white"
            onClick={() => setIsAddFormOpen(true)}
          >
            <i className="ri-add-line mr-1"></i> Novo Terapeuta
          </Button>
        </div>
      )}

      <TherapistForm 
        open={isAddFormOpen}
        onOpenChange={setIsAddFormOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Therapists;
