import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function useWeddingPdfReport(familyId: string, weddingId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings/${weddingId}/report/pdf`, {
        responseType: 'blob',
      });
      downloadBlob(res.data, `wedding-report-${weddingId}.pdf`);
    },
  });
}

export function useWeddingExcelReport(familyId: string, weddingId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings/${weddingId}/report/excel`, {
        responseType: 'blob',
      });
      downloadBlob(res.data, `wedding-report-${weddingId}.xlsx`);
    },
  });
}

export function useEventPdfReport(familyId: string, weddingId: string, eventId: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get(`/families/${familyId}/weddings/${weddingId}/events/${eventId}/report/pdf`, {
        responseType: 'blob',
      });
      downloadBlob(res.data, `event-report-${eventId}.pdf`);
    },
  });
}
