import { apiRequest } from "@/lib/queryClient";
import { FinancialRecord, InsertFinancialRecord } from "@shared/schema";

export interface FinancialRecordsResponse {
  records: FinancialRecord[];
}

export interface FinancialRecordResponse {
  record: FinancialRecord;
  message?: string;
}

export interface FinancialSummaryResponse {
  summary: {
    income: number;
    expenses: number;
    net: number;
  };
  period: string;
  startDate?: string;
  endDate?: string;
}

export const financialService = {
  async getRecords(startDate?: string, endDate?: string): Promise<FinancialRecordsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const url = `/api/financial/records${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getSummary(period?: "week" | "month" | "year", startDate?: string, endDate?: string): Promise<FinancialSummaryResponse> {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const url = `/api/financial/summary${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async createRecord(record: InsertFinancialRecord & { createdViaVoice?: boolean; voiceTranscription?: string; metadata?: any }): Promise<FinancialRecordResponse> {
    const response = await apiRequest("POST", "/api/financial/records", record);
    return response.json();
  },

  async updateRecord(id: number, updates: Partial<FinancialRecord>): Promise<FinancialRecordResponse> {
    const response = await apiRequest("PUT", `/api/financial/records/${id}`, updates);
    return response.json();
  },

  async deleteRecord(id: number): Promise<{ message: string }> {
    const response = await apiRequest("DELETE", `/api/financial/records/${id}`);
    return response.json();
  },
};
