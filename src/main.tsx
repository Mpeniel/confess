import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Layout from "./layouts/Layout.tsx";
import "./index.css";
import Session from "./pages/Session.tsx";
import CampaignsOverview from "./pages/CampaignsOverview.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "session/:id", element: <Session /> },
      { path: "campaigns", element: <CampaignsOverview /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
