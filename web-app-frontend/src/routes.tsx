import './App.css'


import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Home from './pages/home';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
]);

const routes = () => (<RouterProvider router={router}/>)

export default routes
