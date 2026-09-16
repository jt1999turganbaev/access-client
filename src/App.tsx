import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@/shared/query-client/query-client';
import { router } from '@/shared/router/router';
import { theme } from '@/shared/theme';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-center" />
      <RouterProvider router={router} />
    </MantineProvider>
  </QueryClientProvider>
);

export default App;
