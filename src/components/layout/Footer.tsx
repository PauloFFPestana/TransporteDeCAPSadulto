const Footer = () => {
  return (
    <footer className="bg-white border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-neutral-500">&copy; {new Date().getFullYear()} Sistema de Transporte de Pacientes. Todos os direitos reservados.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-neutral-500 hover:text-primary">Ajuda</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-primary">Política de Privacidade</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-primary">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
