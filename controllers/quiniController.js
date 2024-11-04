import { getRandomNumbers, checkIfWon, getUniqueNumbers } from "../utils/quiniHelper.js";
import { connectDB } from '../config/mongodb.js';

// Jugador ingresa sus números
export async function playQuini(req, res) {
    const { numbers } = req.body; // Array de 6 números
    if (numbers.length !== 6) {
        return res.status(400).json({ error: "Debes ingresar exactamente 6 números" });
    }

    try {
        // Ordenar los números jugados antes de guardarlos
        const orderedNumbers = numbers.sort((a, b) => a - b);

        const db = await connectDB();
        const playersCollection = db.collection("players");

        // Guardar los números del jugador en la base de datos
        const result = await playersCollection.insertOne({ numbers: orderedNumbers });
        res.status(201).json({ message: "Jugaste tus números!", id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Error jugando al Quini 6" });
    }
}

// Obtener resultados del sorteo
export async function getResults(req, res) {
    try {
        const db = await connectDB();
        const playersCollection = db.collection("players");
        const sorteosCollection = db.collection("sorteos"); // Nueva colección para los sorteos

        const players = await playersCollection.find().toArray();

        // Realizamos 104 sorteos
        let sorteos = [];
        for (let i = 0; i < 104; i++) {
            const tradicional = getRandomNumbers().sort((a, b) => a - b);
            const segunda = getRandomNumbers().sort((a, b) => a - b);
            const revancha = getRandomNumbers().sort((a, b) => a - b);
            const siempresale = getRandomNumbers().sort((a, b) => a - b);
            const premioExtra = getUniqueNumbers([tradicional, segunda, revancha]).sort((a, b) => a - b);

            // Guardar el sorteo en la base de datos
            await sorteosCollection.insertOne({ 
                sorteoId: i + 1,
                tradicional,
                segunda,
                revancha,
                siempresale,
                premioExtra
            });

            // Agregamos los sorteos al array 'sorteos'
            sorteos.push({ tradicional, segunda, revancha, siempresale, premioExtra });
        }

        // Contadores de números
        const numberCounts = {};

        // Inicializamos contadores para los números del jugador
        players.forEach(player => {
            player.numbers.forEach(number => {
                numberCounts[number] = (numberCounts[number] || 0) + 1;
            });
        });

        // Evaluamos los resultados, incluidos los 104 sorteos y el premio extra
        const resultado = players.map(player => {
            // Ordenar los números del jugador antes de verificar
            const playerNumbers = player.numbers.sort((a, b) => a - b);

            // Generamos el resultado para cada uno de los 104 sorteos
            const sorteosResultado = sorteos.map((sorteo, index) => ({
                sorteoId: index + 1,
                tradicional: checkIfWon(playerNumbers, sorteo.tradicional, "tradicional"),
                segunda: checkIfWon(playerNumbers, sorteo.segunda, "segunda"),
                revancha: checkIfWon(playerNumbers, sorteo.revancha, "revancha"),
                siempresale: checkIfWon(playerNumbers, sorteo.siempresale, "siempresale"),
                premioExtra: checkIfWon(playerNumbers, sorteo.premioExtra, "premioExtra")
            }));

            // Contamos los números sorteados
            sorteos.forEach(sorteo => {
                [...sorteo.tradicional, ...sorteo.segunda, ...sorteo.revancha, ...sorteo.siempresale, ...sorteo.premioExtra].forEach(number => {
                    numberCounts[number] = (numberCounts[number] || 0) + 1;
                });
            });

            // Retornamos los números jugados por el jugador junto con los resultados de los sorteos
            return {
                playerId: player._id,
                playerNumbers, // Números jugados por el jugador
                sorteosResultado, // Resultados de los 104 sorteos
                numberCounts // Conteo de los números
            };
        });

        res.status(200).json({
            sorteos, // Los 104 sorteos
            resultado // Resultados por jugador
        });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener los resultados" });
    }
}
