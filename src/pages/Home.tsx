import React from "react";
import DatabaseStatus from "@/components/DatabaseStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Accueil</CardTitle>
          <DatabaseStatus />
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Bienvenue sur la page d'accueil. Ici, vous pouvez voir l'état de la connexion à la base de données.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
