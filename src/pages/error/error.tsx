import { useRouteError } from 'react-router-dom';
import { ErrorScreen } from '@/features/tablet/ui/screens/error-screen';
import { KioskLayout } from '@/shared/layouts/kiosk-layout/main/kiosk-layout';

function describe(error: unknown) {
  if (!error) return null;
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'object' && 'statusText' in error) return String(error.statusText);
  return String(error);
}

/**
 * Router'ning `errorElement` i: render paytidagi kutilmagan xatolarni ushlaydi.
 * Bu yerda planshet konteksti yo'q, shuning uchun maket o'zi chiziladi.
 */
const ErrorPage = () => {
  const error = useRouteError();

  return (
    <KioskLayout>
      <ErrorScreen detail={describe(error)} />
    </KioskLayout>
  );
};

export default ErrorPage;
