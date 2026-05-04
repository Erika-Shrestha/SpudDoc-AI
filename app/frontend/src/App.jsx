import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import LoadingScreen from "./pages/Loading/LoadingScreen";
import History from "./pages/History/History";
import "./App.css";

function NotFound() {
  const navigate = useNavigate();
  useState(() => { navigate(-1); });
  return null;
}

function Layout() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnalyze = (img) => {
    setUploadedImage(img);
    navigate("/analysis");
  };

  const handleNewAnalysis = () => {
    setUploadedImage(null);
    navigate("/");
  };

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard onAnalyze={handleAnalyze} />} />
      <Route path="/analysis" element={<Analysis image={uploadedImage} onNewAnalysis={handleNewAnalysis} />} />
      <Route path="/history" element={<History />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="app">
      <Layout />
    </div>
  );
}