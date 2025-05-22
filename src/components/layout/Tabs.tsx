import { ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  icon: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
  return (
    <div>
      <div className="bg-white shadow-sm mb-6">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-4 font-medium ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-500 hover:text-primary"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "" : "hidden"}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
