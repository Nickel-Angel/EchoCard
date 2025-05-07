import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "@/App";
import "@/main.css";
import CardMemoLearning from "@/CardMemo/CardMemoLearning";
import CardMemoEnd from "@/CardMemo/CardMemoEnd";
import CardMemoStatistic from "@/CardMemo/CardMemoStatistic";
import TemplateAdd from "@/CardEdit/TemplateAdd";
import CardAdd from "@/CardEdit/CardAdd";
// router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/card-memo-learning",
    element: <CardMemoLearning />,
  },
  {
    path: "/card-memo-end",
    element: <CardMemoEnd />,
  },
  {
    path: "/card-memo-statistic",
    element: <CardMemoStatistic />,
  },
  {
    path: "/template-add",
    element: <TemplateAdd />,
  },
  {
    path: "/card-add",
    element: <CardAdd />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
