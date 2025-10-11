import React, { useEffect, useState } from 'react';
import { getAvailableInstruments } from '../../services/instrumentService';
import {createPlayer, updatePlayer} from "../../services/playerService.js";

const PlayerForm = ({ player, onChange, onSubmit, onCancel, submitLabel, isEditing, filterPupitre }) => {
    const [availableInstruments, setAvailableInstruments] = useState([]);

    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const instruments = await getAvailableInstruments();
                const filtered = filterPupitre
                    ? instruments.filter(instr => instr.pupitre === filterPupitre)
                    : instruments;
                setAvailableInstruments(filtered);
            } catch (error) {
                console.error("Erreur chargement instruments disponibles:", error);
            }
        };
        fetchInstruments();
    }, [filterPupitre]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Normalize nickname: allow empty or null
            const normalizedNickname = player.nickname && player.nickname.trim() !== '' ? player.nickname.trim() : null;

            const playerToSave = {
                firstname: player.firstname,
                lastname: player.lastname,
                nickname: normalizedNickname,
                pupitre: player.pupitre,
                instrumentId: player.instrumentId
            };

            if (isEditing) {
                await updatePlayer(player.id, playerToSave);
            } else {
                await createPlayer(playerToSave);
            }
            onSubmit();
        } catch (error) {
            console.error("Erreur lors de la soumission du formulaire :", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="formulaire">
            <input
                type="text"
                placeholder="Prénom"
                value={player.firstname || ''}
                onChange={(e) => onChange(prev => ({...prev, firstname: e.target.value}))}
                required
            />
            <input
                type="text"
                placeholder="Nom"
                value={player.lastname || ''}
                onChange={(e) => onChange(prev => ({...prev, lastname: e.target.value.toUpperCase()}))}
                required
            />
            <input
                type="text"
                placeholder="Surnom"
                value={player.nickname || ''}
                onChange={(e) => onChange(prev => ({...prev, nickname: e.target.value}))}
            />
            <div className="form-pupitre">
                <p>Pupitre</p>
                <select
                    value={player.pupitre}
                    onChange={(e) => onChange(prev => ({...prev, pupitre: e.target.value, instrumentId: ''}))}
                >
                    <option value=''>Sélectionnez un pupitre</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Dobra">Dobra</option>
                    <option value="Basse 1">Basse 1</option>
                    <option value="Basse 2">Basse 2</option>
                    <option value="Repinique">Répinique</option>
                </select>
            </div>
            <select
                value={player.instrumentId || ''}
                onChange={(e) => onChange(prev => ({...prev, instrumentId: e.target.value}))}
            >
                <option value=''>-- Choisir un instrument --</option>
                {availableInstruments.map(instr => (
                    <option key={instr.id} value={instr.id}>{instr.code}</option>
                ))}
            </select>
            <div className="form-actions">
                <button type="submit">{submitLabel}</button>
                <button type="button" onClick={onCancel}>Annuler</button>
            </div>
        </form>
    );
};

export default PlayerForm;
