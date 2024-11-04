// Genera 6 números aleatorios para el sorteo
export function getRandomNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 46); // Números entre 0 y 45
        numbers.add(randomNumber);
    }
    return Array.from(numbers);
}

// Verifica cuántos números acertó el jugador y si gana según el tipo de sorteo
export function checkIfWon(playerNumbers, drawNumbers, tipoSorteo) {
    const aciertos = playerNumbers.filter(number => drawNumbers.includes(number)).length;

    // Lógica de premios según el tipo de sorteo
    switch (tipoSorteo) {
        case "tradicional":
        case "segunda":
            if (aciertos >= 4) {
                return { gana: true, aciertos }; // Gana con 4, 5 o 6 aciertos
            }
            break;

        case "revancha":
        case "siempresale":
            if (aciertos === 6) {
                return { gana: true, aciertos }; // Gana solo con 6 aciertos
            }
            break;

        case "premioExtra":
            if (aciertos >= 6) {
                return { gana: true, aciertos }; // Premio Extra requiere al menos 6 aciertos
            }
            break;

        default:
            return { gana: false, aciertos }; // No hay ganancia en otros casos
    }

    return { gana: false, aciertos }; // Si no gana, devolvemos aciertos
}

// Extrae 18 números únicos de los primeros 3 sorteos para el Premio Extra
export function getUniqueNumbers(draws) {
    const allNumbers = new Set([...draws[0], ...draws[1], ...draws[2]]);
    return Array.from(allNumbers).slice(0, 18); // Tomar los primeros 18 números únicos
}
