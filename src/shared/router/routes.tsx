import { Navigate, type RouteObject } from 'react-router-dom';
import { TabletRoot } from '@/features/tablet/ui/tablet-root';
import { ROUTES } from '@/shared/constants/routes';
import { Denied, ErrorPage, Idle, NotFound, Processing, Success } from './pages';

/** Marshrutlar jadvali — router'dan alohida. */
export const routes: RouteObject[] = [
  {
    element: <TabletRoot />,
    // Kutilmagan xato: butun daraxt o'rniga xato sahifasi chiziladi
    errorElement: <ErrorPage />,
    children: [
      { path: ROUTES.IDLE, element: <Idle /> },
      { path: ROUTES.PROCESSING, element: <Processing /> },
      { path: ROUTES.SUCCESS, element: <Success /> },
      { path: ROUTES.DENIED, element: <Denied /> },
      { path: ROUTES.NOT_FOUND, element: <NotFound /> },
      { path: ROUTES.ANY, element: <Navigate to={ROUTES.IDLE} replace /> },
    ],
  },
  // Xato sahifasiga to'g'ridan-to'g'ri kirish mumkin (planshet konteksti kerak emas)
  { path: ROUTES.ERROR, element: <ErrorPage /> },
];
