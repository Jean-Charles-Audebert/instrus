// playerService.js
import FirestoreService from "./firestoreService";
import { readInstrument, setFreeInstrument, setTiedInstrument } from "./instrumentService";

const playerService = new FirestoreService("players");

const extractId = (refOrId) => typeof refOrId === "string" ? refOrId : refOrId?.id;

export const isNicknameUnique = async (nickname, excludeId = null) => {
    try {
        // Empty or null nickname is allowed and considered unique
        if (!nickname) return true;
        const players = await playerService.readAll();
        return !players.some(player => player.nickname === nickname && player.id !== excludeId);
    } catch (error) {
        console.error("[PlayerService] Nickname uniqueness check error:", error);
        throw error;
    }
};

const isInstrumentAlreadyAssigned = async (instrumentId, excludePlayerId = null) => {
    const idToCheck = extractId(instrumentId);
    const players = await playerService.readAll();
    return players.some(player => extractId(player.instrumentId) === idToCheck && player.id !== excludePlayerId);
};

export const createPlayer = async (playerData) => {
    // if (!await isNicknameUnique(playerData.nickname)) {
    //     throw new Error("Nickname already used");
    // }

    if (playerData.instrumentId && await isInstrumentAlreadyAssigned(playerData.instrumentId)) {
        throw new Error("Instrument is already assigned to another player");
    }

    try {
        const instrumentId = extractId(playerData.instrumentId);
        const playerId = await playerService.create({
            ...playerData,
            instrumentId,
            lastname: playerData.lastname.toUpperCase()
        });

        if (instrumentId && playerId) {
            await setTiedInstrument(instrumentId, playerId);
        }
        return playerId;
    } catch (error) {
        console.error("[PlayerService] Create error:", error);
        throw error;
    }
};

export const readPlayer = async (playerId) => {
    try {
        const playerData = await playerService.read(playerId);
        const instrumentId = extractId(playerData.instrumentId);

        if (instrumentId) {
            playerData.instrument = await readInstrument(instrumentId);
        }

        return playerData;
    } catch (error) {
        console.error("[PlayerService] Read error:", error);
        throw error;
    }
};

export const readAllPlayers = async () => {
    try {
        const players = await playerService.readAll();

        const enrichedPlayers = await Promise.all(players.map(async (player) => {
            const instrumentId = extractId(player.instrumentId);
            if (instrumentId) {
                player.instrument = await readInstrument(instrumentId);
            }
            return player;
        }));

        return enrichedPlayers;
    } catch (error) {
        console.error("[PlayerService] ReadAll error:", error);
        throw error;
    }
};

export const updatePlayer = async (playerId, playerData) => {
    // if (!await isNicknameUnique(playerData.nickname, playerId)) {
    //     throw new Error("Nickname already used");
    // }

    const newInstrumentId = extractId(playerData.instrumentId);
    if (newInstrumentId && await isInstrumentAlreadyAssigned(newInstrumentId, playerId)) {
        throw new Error("Instrument is already assigned to another player");
    }

    try {
        const currentPlayer = await readPlayer(playerId);
        const currentInstrumentId = extractId(currentPlayer.instrumentId);

        if (currentInstrumentId && currentInstrumentId !== newInstrumentId) {
            await setFreeInstrument(currentInstrumentId);
        }

        if (newInstrumentId && currentInstrumentId !== newInstrumentId) {
            await setTiedInstrument(newInstrumentId, playerId);
        }

        await playerService.update(playerId, {
            ...playerData,
            instrumentId: newInstrumentId,
            lastname: playerData.lastname.toUpperCase()
        });

        return true;
    } catch (error) {
        console.error("[PlayerService] Update error:", error);
        throw error;
    }
};

export const deletePlayer = async (playerId) => {
    try {
        const player = await readPlayer(playerId);
        const instrumentId = extractId(player.instrumentId);

        if (instrumentId) {
            await setFreeInstrument(instrumentId);
        }

        await playerService.delete(playerId);
    } catch (error) {
        console.error("[PlayerService] Delete error:", error);
        throw error;
    }
};
