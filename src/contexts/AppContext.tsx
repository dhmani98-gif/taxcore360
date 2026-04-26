import React, { createContext, useContext, ReactNode } from "react";
import { useAppState } from "../hooks/useAppState";
import { useCalculations } from "../hooks/useCalculations";
import { payrollMonthOptions } from "../app/data";

const AppContext = createContext<any>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const appState = useAppState();
  
  const calculations = useCalculations(
    appState.employees,
    appState.vendors,
    appState.vendorPayments,
    appState.selectedPayrollMonth,
    appState.selected1099Year,
    appState.selectedW2Year,
    appState.selectedW2EmployeeId,
    payrollMonthOptions,
    appState.activeCompanyId
  );

  const contextValue = {
    ...appState,
    ...calculations,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
