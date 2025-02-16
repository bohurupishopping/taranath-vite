import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ReadingResultsPage from '@/pages/ReadingResults';
import Index from '@/pages/Index';
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/reading-results',
    element: <ReadingResultsPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
