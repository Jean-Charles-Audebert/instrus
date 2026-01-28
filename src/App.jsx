import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Modal from 'react-modal';
import { Auth } from './components/auth/Auth';
import PlayerList from "./components/players/PlayerList.jsx";
import InstrumentList from "./components/instruments/InstrumentList.jsx";
import LightStockManagement from "./components/lightstock/LightStockManagement.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import { DataProvider } from "./context/dataContext.jsx";
import { useState } from "react";

const App = () => {
    Modal.setAppElement('#root');
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <DataProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/instrus/" element={<Auth />} />
                    <Route element={<Navbar onSearch={setSearchTerm} />}>
                        <Route path="instrus/players" element={<PlayerList searchTerm={searchTerm} />} />
                        <Route path="instrus/instruments" element={<InstrumentList searchTerm={searchTerm} />} />
                        <Route path="instrus/lightstock" element={<LightStockManagement />} />
                    </Route>
                        <Route path="/instrus" element={<Navigate to="/instrus/" />} />
                    {/*<Route path="*" element={<Navigate to="/instrus/login" />} />*/}
                </Routes>
            </BrowserRouter>
        </DataProvider>
    );
};

export default App;
