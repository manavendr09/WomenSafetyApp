import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import SafestRoute from './components/SafestRoute';
import { AuthProvider } from './contexts/authcontexts';
import Home from './components/Home'; 
import Contacts from './components/Contacts';
import Courses from './components/Courses';
import Police from './components/Police';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/safest-route",
    element: <SafestRoute />,
  },
  {
    path: "/Contacts",
    element:<Contacts/>,
  },
  {
    path: "/courses",
    element:<Courses/>
  },
  {
    path: "/police",
    element: <Police/>
  }
]);


const App = () => {
  return(
  <AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
  )
  
};

export default App;
