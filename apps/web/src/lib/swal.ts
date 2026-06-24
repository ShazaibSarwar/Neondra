import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// A themed version of SweetAlert2 matching our "Pro Max" glass UI
export const swal = MySwal.mixin({
  customClass: {
    popup: 'glass-card border-white/10 !bg-background/90 backdrop-blur-xl',
    title: 'text-foreground font-bold',
    htmlContainer: 'text-muted-foreground',
    confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-primary/25',
    cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-xl font-medium transition-all ml-3',
  },
  buttonsStyling: false,
  background: 'transparent',
});

export const showAlert = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success', text?: string) => {
  return swal.fire({
    title,
    text,
    icon,
  });
};

export const showConfirm = async (title: string, text?: string, confirmText: string = 'Yes, delete it!') => {
  const result = await swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};
