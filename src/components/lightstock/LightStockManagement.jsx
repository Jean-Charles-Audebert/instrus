import React, { useEffect, useState } from 'react';
import { getLightInstrumentsWithStock, toggleLightStock, calculateTotals, formatPlayerName } from '../../services/lightStockService';
import './LightStockManagement.css';

const LightStockManagement = () => {
    const [instruments, setInstruments] = useState([]);
    const [totals, setTotals] = useState({ totalInstruments: 0, totalAssigned: 0, totalInStock: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLightInstruments();
    }, []);

    const fetchLightInstruments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLightInstrumentsWithStock();
            setInstruments(data);
            setTotals(calculateTotals(data));
        } catch (err) {
            console.error("Erreur lors du chargement du stock lumières:", err);
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStock = async (instrument) => {
        try {
            // Optimistic update pour une meilleure UX mobile
            const updatedInstruments = instruments.map(inst =>
                inst.id === instrument.id
                    ? { ...inst, isLightStock: !inst.isLightStock }
                    : inst
            );
            setInstruments(updatedInstruments);
            setTotals(calculateTotals(updatedInstruments));

            // Mise à jour en BDD
            await toggleLightStock(instrument.id, instrument);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du stock:", err);
            // Revenir à l'état précédent en cas d'erreur
            await fetchLightInstruments();
            setError("Erreur lors de la mise à jour du stock");
        }
    };

    if (loading) {
        return <div className="light-stock-container loading">Chargement...</div>;
    }

    if (error) {
        return (
            <div className="light-stock-container error">
                <p>{error}</p>
                <button onClick={fetchLightInstruments}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="light-stock-container">
            <div className="light-stock-header">
                <h1>Stock Lumières</h1>
            </div>

            <table className="light-stock-table">
                <thead>
                    <tr>
                        <th>Instru</th>
                        <th>Joueur</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {instruments.map((instrument, index) => (
                        <tr key={instrument.id} className={index === instruments.findIndex(i => i.isFree) ? 'separator' : ''}>
                            <td className="instru-code">{instrument.code}</td>
                            <td className="player-name">{formatPlayerName(instrument.player)}</td>
                            <td className="stock-toggle">
                                <input
                                    type="checkbox"
                                    checked={instrument.isLightStock === true}
                                    onChange={() => handleToggleStock(instrument)}
                                    className="stock-checkbox"
                                    title={instrument.isLightStock ? "En caisse" : "Chez le joueur"}
                                />
                                <span className="stock-label">
                                    {instrument.isLightStock ? "Joueur" : "Stock"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="totals-row">
                        <td className="total-label">Total: {totals.totalInstruments}</td>
                        <td className="total-label">Attribués: {totals.totalAssigned}</td>
                        <td className="total-label">En stock: {totals.totalInStock}</td>
                    </tr>
                </tfoot>
            </table>

            <button onClick={fetchLightInstruments} className="refresh-button">
                🔄 Rafraîchir
            </button>
        </div>
    );
};

export default LightStockManagement;
