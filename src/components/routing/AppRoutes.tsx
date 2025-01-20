import { Routes, Route } from "react-router-dom";
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { Closet } from "@/pages/Closet";
import { Add } from "@/pages/Add";
import { Profile } from "@/pages/Profile";
import { Admin } from "@/pages/Admin";
import { Contest } from "@/pages/Contest";
import { Discover } from "@/pages/Discover";
import { Favorites } from "@/pages/Favorites";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/closet"
        element={
          <ProtectedRoute>
            <Closet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <Add />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest"
        element={
          <ProtectedRoute>
            <Contest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};