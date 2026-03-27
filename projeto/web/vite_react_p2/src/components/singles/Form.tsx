import { useState } from 'react';
import { toast } from 'sonner';

type FormProps = {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  autoComplete?: string;
  allowSpam?: boolean;
  spamDelay?: number;
};

function Form(props: FormProps) {
  const [isThrottled, setIsThrottled] = useState(false);
  const shouldPreventSpam = props.allowSpam !== true;
  const delay = props.spamDelay || 2000; // Default 2 segundos

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (shouldPreventSpam && isThrottled) {
      toast.warning('Aguarde antes de enviar novamente.');
      return; // Ignorar clique se estiver em throttle
    }

    if (shouldPreventSpam) {
      // Iniciar throttle
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, delay);
    }

    if (props.onSubmit) {
      props.onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={props.className} autoComplete={props.autoComplete}>
      {props.children}
    </form>
  );
}

export default Form;
