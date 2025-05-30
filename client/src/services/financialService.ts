export const financialService = {
  async getRecords(startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/financial/records${query}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  async getSummary(period?: string) {
    const params = period ? `?period=${period}` : '';
    const response = await fetch(`/api/financial/summary${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  async createRecord(record: any) {
    const response = await fetch('/api/financial/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return response.json();
  },

  async updateRecord(id: number, updates: any) {
    const response = await fetch(`/api/financial/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async deleteRecord(id: number) {
    const response = await fetch(`/api/financial/records/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};