import { Link, useLocation } from "wouter";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="ri-bus-line text-2xl"></i>
          <h1 className="text-xl font-semibold">Sistema de Transporte de Pacientes</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <span className="text-sm">Admin</span>
          </div>
          <button className="p-2 rounded-full hover:bg-white hover:bg-opacity-20">
            <i className="ri-user-line"></i>
          </button>
        </div>
      </div>
      <div className="bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <Link href="/">
              <a className={`px-5 py-4 font-medium ${location === '/' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-calendar-check-line mr-2"></i>Transporte
              </a>
            </Link>
            <Link href="/atividades">
              <a className={`px-5 py-4 font-medium ${location === '/atividades' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-calendar-event-line mr-2"></i>Atividades
              </a>
            </Link>
            <Link href="/atividades-pacientes">
              <a className={`px-5 py-4 font-medium ${location === '/atividades-pacientes' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-user-settings-line mr-2"></i>Pacientes/Atividades
              </a>
            </Link>
            <Link href="/pacientes">
              <a className={`px-5 py-4 font-medium ${location === '/pacientes' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-user-line mr-2"></i>Pacientes
              </a>
            </Link>
            <Link href="/terapeutas">
              <a className={`px-5 py-4 font-medium ${location === '/terapeutas' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-mental-health-line mr-2"></i>Terapeutas
              </a>
            </Link>
            <Link href="/relatorios">
              <a className={`px-5 py-4 font-medium ${location === '/relatorios' ? 'text-primary border-b-2 border-primary' : 'text-neutral-500 hover:text-primary'}`}>
                <i className="ri-file-chart-line mr-2"></i>Relatórios
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
