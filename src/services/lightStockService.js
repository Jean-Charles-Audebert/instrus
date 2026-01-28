import { readAllInstruments, updateInstrument } from "./instrumentService";
import { readAllPlayers } from "./playerService";

/**
 * Récupère tous les instruments éclairés avec leurs infos joueur
 * Retourne les données triées : d'abord avec joueur, puis sans joueur
 */
export const getLightInstrumentsWithStock = async () => {
    try {
        const instruments = await readAllInstruments();
        const players = await readAllPlayers();

        // Filtrer les instruments éclairés
        const lightInstruments = instruments.filter(inst => inst.hasLight === true);

        // Enrichir avec les infos joueur
        const enriched = lightInstruments.map(inst => ({
            ...inst,
            player: inst.playerId ? players.find(p => p.id === inst.playerId) : null,
        }));

        // Trier : d'abord avec joueur (isFree: false), puis sans joueur (isFree: true)
        const sorted = enriched.sort((a, b) => {
            // Si les deux ont un joueur ou aucun, trier par code
            if (a.isFree === b.isFree) {
                return a.code.localeCompare(b.code);
            }
            // Les instruments avec joueur (isFree: false) en premier
            return a.isFree ? 1 : -1;
        });

        return sorted;
    } catch (error) {
        console.error("[LightStockService] Error fetching light instruments:", error);
        throw error;
    }
};

/**
 * Bascule l'état du stock (en caisse <-> prêté)
 */
export const toggleLightStock = async (instrumentId, instrumentData) => {
    try {
        const newIsLightStock = !instrumentData.isLightStock;
        await updateInstrument(instrumentId, {
            ...instrumentData,
            isLightStock: newIsLightStock
        });
        return newIsLightStock;
    } catch (error) {
        console.error("[LightStockService] Error toggling light stock:", error);
        throw error;
    }
};

/**
 * Calcule les totaux pour le tableau
 */
export const calculateTotals = (instruments) => {
    const totalInstruments = instruments.length;
    const totalAssigned = instruments.filter(inst => !inst.isFree).length;
    const totalInStock = instruments.filter(inst => inst.isLightStock === true).length;

    return {
        totalInstruments,
        totalAssigned,
        totalInStock
    };
};

/**
 * Formate le nom du joueur : "Prénom + initiale du nom"
 */
export const formatPlayerName = (player) => {
    if (!player) return "—";
    const initial = player.lastname ? player.lastname.charAt(0).toUpperCase() : "";
    return `${player.firstname}${initial ? " " + initial : ""}`;
};
