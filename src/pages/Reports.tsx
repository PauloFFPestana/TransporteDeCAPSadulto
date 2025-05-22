import { useState } from "react";
import ReportCharts from "@/components/reports/ReportCharts";

const Reports = () => {
  // Default date range is last 7 days
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState<string>(
    lastWeek.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      <ReportCharts startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default Reports;
